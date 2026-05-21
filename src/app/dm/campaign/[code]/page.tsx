'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character, FateEvent, FateEventType } from '@/types'

type Tab = 'roster' | 'fate'

const EVENT_TYPES: { value: FateEventType; label: string; description: string }[] = [
  { value: 'attack',   label: 'Attack',   description: 'Someone is targeted by danger' },
  { value: 'curse',    label: 'Curse',    description: 'A dark power takes hold' },
  { value: 'windfall', label: 'Windfall', description: 'Fortune unexpectedly smiles' },
  { value: 'betrayal', label: 'Betrayal', description: 'Trust is about to shatter' },
  { value: 'mystery',  label: 'Mystery',  description: 'The fates remain cryptic' },
]

export default function DmControlPanel() {
  const { code } = useParams<{ code: string }>()
  const [tab, setTab] = useState<Tab>('roster')
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoster = useCallback(async (cid: string) => {
    const res = await fetch(`/api/campaigns/roster?campaignId=${cid}`)
    const data: unknown = await res.json()
    if (isRosterResponse(data)) setCharacters(data.characters)
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data } = await supabase.from('campaigns').select('id').eq('code', code.toUpperCase()).single()
      if (!data) { setLoading(false); return }
      setCampaignId(data.id as string)
      await fetchRoster(data.id as string)
      setLoading(false)
    }
    void init()
  }, [code, fetchRoster])

  // Realtime: roster HP changes
  useEffect(() => {
    if (!campaignId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`roster:${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'characters', filter: `campaign_id=eq.${campaignId}` },
        () => { void fetchRoster(campaignId) })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [campaignId, fetchRoster])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">DM Panel</h1>
          <p className="text-stone-400 font-mono text-xs">{code.toUpperCase()}</p>
        </div>
        <span className="text-xs text-stone-500 bg-stone-900 px-2 py-1 rounded">
          {characters.length} player{characters.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="border-b border-stone-800 flex">
        {(['roster', 'fate'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${
              tab === t
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            {t === 'fate' ? 'Fate Engine' : 'Roster'}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'roster' && <RosterTab characters={characters} code={code} />}
        {tab === 'fate' && campaignId && (
          <FateTab campaignId={campaignId} characters={characters} />
        )}
      </div>
    </main>
  )
}

// ── Roster Tab ────────────────────────────────────────────────────────────────

function RosterTab({ characters, code }: { characters: Character[]; code: string }) {
  if (characters.length === 0) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="text-lg">No players yet</p>
        <p className="text-sm mt-1">Share the campaign code to get started</p>
        <p className="font-mono text-2xl font-bold text-amber-400 mt-4">{code.toUpperCase()}</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {characters.map(c => <CharacterCard key={c.id} character={c} />)}
    </div>
  )
}

function CharacterCard({ character: c }: { character: Character }) {
  const hpPercent = Math.max(0, (c.currentHp / c.maxHp) * 100)
  const hpColor = hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{c.characterName}</p>
          <p className="text-stone-400 text-sm">{c.playerName} · {c.class} {c.level}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">{c.currentHp}</span>
          <span className="text-stone-500 text-sm"> / {c.maxHp} HP</span>
        </div>
      </div>
      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${hpColor}`} style={{ width: `${hpPercent}%` }} />
      </div>
      <div className="flex items-center gap-3 text-sm text-stone-400">
        <span>AC {c.armorClass}</span>
        {c.conditions.length > 0 && (
          <span className="text-amber-400">{c.conditions.map(cn => cn.name).join(', ')}</span>
        )}
        {c.pushSubscription && <span className="text-emerald-600 text-xs">● push</span>}
      </div>
    </div>
  )
}

// ── Fate Engine Tab ───────────────────────────────────────────────────────────

type FateState = 'idle' | 'pending_reveal' | 'revealed'

function FateTab({ campaignId, characters }: { campaignId: string; characters: Character[] }) {
  const [eventType, setEventType] = useState<FateEventType>('mystery')
  const [dangerWeighted, setDangerWeighted] = useState(false)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [fateState, setFateState] = useState<FateState>('idle')
  const [pendingEvent, setPendingEvent] = useState<FateEvent | null>(null)
  const [revealedTarget, setRevealedTarget] = useState<Character | null>(null)
  const [fateLog, setFateLog] = useState<(FateEvent & { targetName: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [pushSent, setPushSent] = useState(false)

  const loadLog = useCallback(async () => {
    const res = await fetch(`/api/fate/log?campaignId=${campaignId}`)
    const data: unknown = await res.json()
    if (isFateLogResponse(data)) {
      setFateLog(data.events.map(e => ({
        ...e,
        targetName: characters.find(c => c.id === e.targetCharacterId)?.characterName ?? 'Unknown',
      })))
    }
  }, [campaignId, characters])

  useEffect(() => { void loadLog() }, [loadLog])

  function toggleExclude(id: string) {
    setExcluded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function handleDraw() {
    setLoading(true)
    try {
      const res = await fetch('/api/fate/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, eventType, excludedCharacterIds: Array.from(excluded), dangerWeighted }),
      })
      const data: unknown = await res.json()
      if (!res.ok || !isDrawResponse(data)) return
      setPendingEvent(data.fateEvent)
      setPushSent(data.pushSent)
      setFateState('pending_reveal')
    } finally {
      setLoading(false)
    }
  }

  async function handleReveal() {
    if (!pendingEvent) return
    setLoading(true)
    try {
      await fetch('/api/fate/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fateEventId: pendingEvent.id }),
      })
      setRevealedTarget(characters.find(c => c.id === pendingEvent.targetCharacterId) ?? null)
      setFateState('revealed')
      void loadLog()
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setFateState('idle'); setPendingEvent(null); setRevealedTarget(null); setPushSent(false)
  }

  return (
    <div className="space-y-6">

      {fateState === 'idle' && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-stone-300 mb-2">Event Type</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EVENT_TYPES.map(et => (
                <button key={et.value} onClick={() => setEventType(et.value)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    eventType === et.value
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600'
                  }`}>
                  <p className="font-medium text-sm">{et.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{et.description}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setDangerWeighted(v => !v)}>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${dangerWeighted ? 'bg-amber-600' : 'bg-stone-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${dangerWeighted ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-300">Danger Weighted</p>
              <p className="text-xs text-stone-500">Lower HP = more likely to be chosen</p>
            </div>
          </label>

          {characters.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-300 mb-2">Exclude from Pool</p>
              <div className="flex flex-wrap gap-2">
                {characters.map(c => (
                  <button key={c.id} onClick={() => toggleExclude(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      excluded.has(c.id)
                        ? 'border-stone-600 bg-stone-800 text-stone-500 line-through'
                        : 'border-stone-700 bg-stone-900 text-stone-300 hover:border-stone-500'
                    }`}>
                    {c.characterName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleDraw} disabled={loading || characters.length === 0}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">
            {loading ? 'Casting fate…' : 'Cast Fate'}
          </button>
        </div>
      )}

      {fateState === 'pending_reveal' && pendingEvent && (
        <div className="text-center space-y-6 py-6">
          <div className="space-y-2">
            <p className="text-stone-400 text-sm uppercase tracking-widest">The fates have spoken</p>
            <p className="text-xl font-semibold">{EVENT_TYPES.find(e => e.value === pendingEvent.eventType)?.label}</p>
            {pushSent
              ? <p className="text-emerald-400 text-sm">A chosen soul has been notified…</p>
              : <p className="text-stone-500 text-sm">Target selected. Ready to reveal.</p>
            }
          </div>
          <button onClick={handleReveal} disabled={loading}
            className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-xl animate-pulse">
            {loading ? 'Revealing…' : '⚡ Reveal'}
          </button>
        </div>
      )}

      {fateState === 'revealed' && revealedTarget && pendingEvent && (
        <div className="text-center space-y-4 py-6">
          <p className="text-stone-400 text-sm uppercase tracking-widest">Fate has chosen</p>
          <div className="bg-stone-900 border-2 border-amber-500 rounded-2xl p-6 space-y-1">
            <p className="text-3xl font-bold text-amber-400">{revealedTarget.characterName}</p>
            <p className="text-stone-400">{revealedTarget.playerName} · {revealedTarget.class}</p>
            <p className="text-sm text-stone-500 mt-2">{EVENT_TYPES.find(e => e.value === pendingEvent.eventType)?.description}</p>
          </div>
          <button onClick={handleReset} className="text-sm text-stone-500 hover:text-stone-300 underline">
            Draw again
          </button>
        </div>
      )}

      {fateLog.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-stone-500 uppercase tracking-widest">Fate Log</p>
          {fateLog.map(e => (
            <div key={e.id} className="flex items-center justify-between text-sm bg-stone-900 rounded-lg px-3 py-2">
              <span className="text-stone-300 capitalize">{e.eventType}</span>
              <span className="text-amber-400 font-medium">{e.targetName}</span>
              <span className="text-stone-600 text-xs">
                {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Type guards ───────────────────────────────────────────────────────────────

function isRosterResponse(v: unknown): v is { characters: Character[] } {
  return typeof v === 'object' && v !== null && 'characters' in v && Array.isArray((v as Record<string, unknown>).characters)
}
function isDrawResponse(v: unknown): v is { fateEvent: FateEvent; pushSent: boolean } {
  return typeof v === 'object' && v !== null && 'fateEvent' in v
}
function isFateLogResponse(v: unknown): v is { events: FateEvent[] } {
  return typeof v === 'object' && v !== null && 'events' in v && Array.isArray((v as Record<string, unknown>).events)
}
