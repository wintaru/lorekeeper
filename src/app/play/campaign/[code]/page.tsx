'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character, FateEvent, FateEventType, Whisper } from '@/types'

const XP_THRESHOLDS = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]
function xpForNextLevel(level: number) { return level >= 20 ? null : XP_THRESHOLDS[level] }

type RollEntry = { label: string; result: number | string; timestamp: Date }

function rollExpression(expr: string): number | string {
  try {
    const clean = expr.trim().toLowerCase()
    const match = clean.match(/^(\d+)d(\d+)([+-]\d+)?$/)
    if (match) {
      const count = parseInt(match[1])
      const sides = parseInt(match[2])
      const mod = match[3] ? parseInt(match[3]) : 0
      if (count < 1 || count > 100 || sides < 2 || sides > 1000) return 'Invalid'
      let total = 0
      for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1
      return total + mod
    }
    if (/^\d+$/.test(clean)) return parseInt(clean)
    return 'Invalid'
  } catch { return 'Invalid' }
}

const EVENT_LABELS: Record<FateEventType, string> = {
  attack:   'Attack',
  curse:    'Curse',
  windfall: 'Windfall',
  betrayal: 'Betrayal',
  mystery:  'Mystery',
}

const EVENT_TOAST: Record<FateEventType, { message: string; classes: string }> = {
  attack:   { message: 'An attack is coming for you…',    classes: 'bg-red-950 border-red-500 text-red-200' },
  curse:    { message: 'A dark power takes hold…',         classes: 'bg-purple-950 border-purple-500 text-purple-200' },
  windfall: { message: 'Fortune smiles upon you…',         classes: 'bg-emerald-950 border-emerald-500 text-emerald-200' },
  betrayal: { message: 'Trust is about to shatter…',       classes: 'bg-orange-950 border-orange-500 text-orange-200' },
  mystery:  { message: 'The fates have chosen you…',       classes: 'bg-amber-950 border-amber-500 text-amber-200' },
}

export default function PlayerCampaignPage() {
  const { code } = useParams<{ code: string }>()
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [fateLog, setFateLog] = useState<FateEvent[]>([])
  const [whispers, setWhispers] = useState<Whisper[]>([])
  const [loading, setLoading] = useState(true)
  const [pushStatus, setPushStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle')
  const [fateToast, setFateToast] = useState<FateEventType | null>(null)
  const [whisperToast, setWhisperToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const whisperToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([])
  const [rollExpr, setRollExpr] = useState('')

  const loadCharacter = useCallback(async (cid: string) => {
    const characterId = sessionStorage.getItem(`character_${code.toUpperCase()}`)
    if (!characterId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('characters')
      .select()
      .eq('id', characterId)
      .eq('campaign_id', cid)
      .single()
    if (data) setCharacter(rowToCharacter(data))
  }, [code])

  const loadFateLog = useCallback(async (cid: string, characterId: string) => {
    const res = await fetch(`/api/fate/log?campaignId=${cid}&characterId=${characterId}`)
    const data: unknown = await res.json()
    if (isFateLogResponse(data)) setFateLog(data.events)
  }, [])

  const loadWhispers = useCallback(async (characterId: string) => {
    const res = await fetch(`/api/whispers?characterId=${characterId}`)
    const data: unknown = await res.json()
    if (isWhispersResponse(data)) setWhispers(data.whispers)
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data } = await supabase.from('campaigns').select('id').eq('code', code.toUpperCase()).single()
      if (!data) { setLoading(false); return }
      const cid = data.id as string
      setCampaignId(cid)
      await loadCharacter(cid)
      setLoading(false)
    }
    void init()
  }, [code, loadCharacter])

  // Load fate log and whispers once character is known
  useEffect(() => {
    if (!character || !campaignId) return
    void loadFateLog(campaignId, character.id)
    void loadWhispers(character.id)
  }, [character?.id, campaignId, loadFateLog, loadWhispers])

  // Realtime: HP updates, fate draws (toast), fate reveals (log refresh), whispers (toast + log)
  useEffect(() => {
    if (!character || !campaignId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`player:${character.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'characters', filter: `id=eq.${character.id}` },
        payload => { if (payload.new) setCharacter(rowToCharacter(payload.new as Record<string, unknown>)) })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fate_events', filter: `target_character_id=eq.${character.id}` },
        payload => {
          const eventType = (payload.new as Record<string, unknown>).event_type as FateEventType
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
          setFateToast(eventType)
          toastTimerRef.current = setTimeout(() => setFateToast(null), 6000)
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'fate_events', filter: `campaign_id=eq.${campaignId}` },
        () => { void loadFateLog(campaignId, character.id) })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whispers', filter: `character_id=eq.${character.id}` },
        payload => {
          const row = payload.new as Record<string, unknown>
          const whisper: Whisper = {
            id: row.id as string,
            characterId: row.character_id as string,
            message: row.message as string,
            createdAt: new Date(row.created_at as string),
          }
          setWhispers(prev => [whisper, ...prev])
          if (whisperToastTimerRef.current) clearTimeout(whisperToastTimerRef.current)
          setWhisperToast(whisper.message)
          whisperToastTimerRef.current = setTimeout(() => setWhisperToast(null), 8000)
        })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (whisperToastTimerRef.current) clearTimeout(whisperToastTimerRef.current)
    }
  }, [character?.id, campaignId, loadFateLog])

  // Register service worker and subscribe to push.
  // Always run on character load so this browser's subscription is synced to the DB —
  // the player may have previously subscribed on a different device or cleared storage.
  useEffect(() => {
    if (!character?.id) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported')
      return
    }
    void subscribeToPush(character.id, setPushStatus)
  }, [character?.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </main>
    )
  }

  if (!character) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-stone-400">Character not found.</p>
          <a href="/play" className="text-amber-400 hover:underline text-sm">Rejoin campaign</a>
        </div>
      </main>
    )
  }

  const hpPercent = Math.max(0, (character.currentHp / character.maxHp) * 100)
  const hpColor = hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-4">
      {fateToast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm border-2 rounded-2xl px-5 py-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${EVENT_TOAST[fateToast].classes}`}>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-1">The fates have spoken</p>
          <p className="text-lg font-bold leading-snug">{EVENT_TOAST[fateToast].message}</p>
          <p className="text-xs opacity-50 mt-2 uppercase tracking-widest">{EVENT_LABELS[fateToast]}</p>
          <button onClick={() => setFateToast(null)} className="absolute top-3 right-4 opacity-40 hover:opacity-80 text-sm transition-opacity">✕</button>
        </div>
      )}
      {whisperToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm border-2 border-amber-700 bg-stone-950 rounded-2xl px-5 py-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500 mb-1">DM Whisper</p>
          <p className="text-base text-stone-100 leading-snug">{whisperToast}</p>
          <button onClick={() => setWhisperToast(null)} className="absolute top-3 right-4 text-stone-600 hover:text-stone-400 text-sm transition-opacity">✕</button>
        </div>
      )}
      <div className="max-w-sm mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{character.characterName}</h1>
          <p className="text-stone-400">{character.playerName} · {character.class} {character.level}</p>
          <p className="font-mono text-stone-500 text-xs mt-0.5">{code.toUpperCase()}</p>
        </div>

        {/* Push notification status */}
        {pushStatus === 'denied' && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2 text-xs text-red-400">
            Notifications blocked. Enable them in browser settings to receive fate alerts.
          </div>
        )}
        {pushStatus === 'subscribed' && (
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg px-3 py-2 text-xs text-emerald-400">
            ● Fate notifications active
          </div>
        )}

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-stone-400 text-sm">Hit Points</span>
            <div>
              <span className="text-3xl font-bold">{character.currentHp}</span>
              <span className="text-stone-500"> / {character.maxHp}</span>
            </div>
          </div>
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${hpColor}`} style={{ width: `${hpPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 text-center">
            <p className="text-stone-400 text-xs">Armor Class</p>
            <p className="text-2xl font-bold mt-1">{character.armorClass}</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 text-center">
            <p className="text-stone-400 text-xs">Level</p>
            <p className="text-2xl font-bold mt-1">{character.level}</p>
          </div>
        </div>

        {/* XP progress */}
        {(() => {
          const nextXp = xpForNextLevel(character.level)
          const prevXp = XP_THRESHOLDS[character.level - 1] ?? 0
          const xpPercent = nextXp ? Math.min(100, ((character.xp - prevXp) / (nextXp - prevXp)) * 100) : 100
          return (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 text-xs uppercase tracking-widest">Experience</span>
                <span className="text-stone-300 text-sm tabular-nums">
                  {character.xp.toLocaleString()}{nextXp ? ` / ${nextXp.toLocaleString()}` : ' (max)'}
                </span>
              </div>
              <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
              {nextXp && (
                <p className="text-xs text-stone-600 text-right tabular-nums">
                  {(nextXp - character.xp).toLocaleString()} XP to level {character.level + 1}
                </p>
              )}
            </div>
          )
        })()}

        {character.conditions.length > 0 && (
          <div className="bg-stone-900 border border-amber-900/50 rounded-xl p-3">
            <p className="text-stone-400 text-xs mb-2">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {character.conditions.map(c => (
                <span key={c.name} className="text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full">
                  {c.name}{c.roundsRemaining !== null ? ` (${c.roundsRemaining}r)` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Death saves — only when downed */}
        {character.currentHp === 0 && (
          <div className="bg-stone-900 border border-red-900/50 rounded-xl p-4">
            <p className="text-xs text-red-400 uppercase tracking-widest mb-3">Death Saves</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-500">Successes</span>
                {[0, 1, 2].map(i => (
                  <button key={i}
                    onClick={() => void updateDeathSave(character.id, 'success', character.deathSaves, setCharacter)}
                    className={`w-7 h-7 rounded-full border-2 transition-colors ${i < character.deathSaves.successes ? 'bg-emerald-500 border-emerald-400' : 'border-stone-600 bg-stone-800'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">Failures</span>
                {[0, 1, 2].map(i => (
                  <button key={i}
                    onClick={() => void updateDeathSave(character.id, 'failure', character.deathSaves, setCharacter)}
                    className={`w-7 h-7 rounded-full border-2 transition-colors ${i < character.deathSaves.failures ? 'bg-red-500 border-red-400' : 'border-stone-600 bg-stone-800'}`}
                  />
                ))}
              </div>
            </div>
            {character.deathSaves.successes >= 3 && <p className="text-emerald-400 text-sm mt-3 font-medium">You are stable.</p>}
            {character.deathSaves.failures >= 3 && <p className="text-red-400 text-sm mt-3 font-medium">You have fallen.</p>}
          </div>
        )}

        {/* Spell slots */}
        {character.spellSlots.length > 0 && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">Spell Slots</p>
            <div className="space-y-2">
              {character.spellSlots.map(slot => (
                <div key={slot.level} className="flex items-center gap-3">
                  <span className="text-stone-500 text-xs w-12 shrink-0">Level {slot.level}</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: slot.total }).map((_, i) => {
                      const isUsed = i < slot.used
                      return (
                        <button key={i}
                          onClick={() => void toggleSpellSlot(character.id, slot.level, i, character.spellSlots, setCharacter)}
                          className={`w-6 h-6 rounded-full border-2 transition-colors ${isUsed ? 'border-stone-600 bg-stone-800' : 'border-violet-500 bg-violet-900/50'}`}
                        />
                      )
                    })}
                  </div>
                  <span className="text-xs text-stone-500 tabular-nums">{slot.total - slot.used}/{slot.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(whispers.length > 0 || fateLog.length > 0) && (() => {
          type LogEntry =
            | { kind: 'whisper'; id: string; message: string; createdAt: Date }
            | { kind: 'fate'; id: string; eventType: FateEventType; createdAt: Date }

          const entries: LogEntry[] = [
            ...whispers.map(w => ({ kind: 'whisper' as const, id: w.id, message: w.message, createdAt: w.createdAt })),
            ...fateLog.map(e => ({ kind: 'fate' as const, id: e.id, eventType: e.eventType, createdAt: e.createdAt })),
          ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

          return (
            <div className="space-y-2">
              <p className="text-xs text-stone-500 uppercase tracking-widest">Event Log</p>
              {entries.map(entry => (
                <div key={entry.id} className={`border rounded-lg px-3 py-2.5 flex items-start justify-between gap-3 ${
                  entry.kind === 'whisper'
                    ? 'bg-stone-900 border-amber-900/40'
                    : 'bg-stone-900 border-stone-800'
                }`}>
                  {entry.kind === 'whisper' ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-500 uppercase tracking-wider mb-0.5">DM Whisper</p>
                      <p className="text-sm text-stone-200 break-words">{entry.message}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-amber-400 text-sm font-medium">{EVENT_LABELS[entry.eventType]}</span>
                      <span className="text-xs text-stone-500">fate event</span>
                    </div>
                  )}
                  <span className="text-stone-600 text-xs shrink-0 mt-0.5">
                    {entry.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Dice roller */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
          <p className="text-xs text-stone-500 uppercase tracking-widest">Dice Roller</p>
          <div className="flex flex-wrap gap-2">
            {([4,6,8,10,12,20,100] as const).map(d => (
              <button
                key={d}
                onClick={() => {
                  const result = Math.floor(Math.random() * d) + 1
                  setRollHistory(h => [{ label: `d${d}`, result, timestamp: new Date() }, ...h].slice(0, 20))
                }}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-sm font-medium transition-colors"
              >
                d{d}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={rollExpr}
              onChange={e => setRollExpr(e.target.value)}
              onKeyDown={e => {
                if (e.key !== 'Enter' || !rollExpr.trim()) return
                const result = rollExpression(rollExpr)
                setRollHistory(h => [{ label: rollExpr.trim(), result, timestamp: new Date() }, ...h].slice(0, 20))
                setRollExpr('')
              }}
              placeholder="2d6+3"
              className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={() => {
                if (!rollExpr.trim()) return
                const result = rollExpression(rollExpr)
                setRollHistory(h => [{ label: rollExpr.trim(), result, timestamp: new Date() }, ...h].slice(0, 20))
                setRollExpr('')
              }}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors"
            >
              Roll
            </button>
          </div>
          {rollHistory.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {rollHistory.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-stone-400">{r.label}</span>
                  <span className="font-bold text-amber-300 tabular-nums">{r.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

async function updateDeathSave(
  characterId: string,
  type: 'success' | 'failure',
  current: Character['deathSaves'],
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>,
) {
  const deathSaves = {
    successes: type === 'success' ? Math.min(3, current.successes + 1) : current.successes,
    failures: type === 'failure' ? Math.min(3, current.failures + 1) : current.failures,
  }
  await fetch('/api/characters/death-saves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, deathSaves }),
  })
  setCharacter(prev => prev ? { ...prev, deathSaves } : prev)
}

async function toggleSpellSlot(
  characterId: string,
  level: number,
  slotIndex: number,
  currentSlots: Character['spellSlots'],
  setCharacter: React.Dispatch<React.SetStateAction<Character | null>>,
) {
  const spellSlots = currentSlots.map(s => {
    if (s.level !== level) return s
    const isUsed = slotIndex < s.used
    return { ...s, used: isUsed ? Math.max(0, s.used - 1) : Math.min(s.total, s.used + 1) }
  })
  await fetch('/api/characters/spell-slots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, spellSlots }),
  })
  setCharacter(prev => prev ? { ...prev, spellSlots } : prev)
}

async function subscribeToPush(
  characterId: string,
  setStatus: (s: 'idle' | 'subscribed' | 'denied' | 'unsupported') => void,
) {
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // If this browser already has an active push subscription, sync it to the DB
    // so whispers go to the right device (not a stale subscription from another browser).
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, subscription: existing.toJSON() }),
      })
      setStatus('subscribed')
      return
    }

    // No existing subscription — request permission and create one.
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { setStatus('denied'); return }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, subscription: subscription.toJSON() }),
    })

    setStatus('subscribed')
  } catch {
    setStatus('denied')
  }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i)
  return buffer
}

function isFateLogResponse(v: unknown): v is { events: FateEvent[] } {
  return typeof v === 'object' && v !== null && 'events' in v && Array.isArray((v as Record<string, unknown>).events)
}

function isWhispersResponse(v: unknown): v is { whispers: Whisper[] } {
  return typeof v === 'object' && v !== null && 'whispers' in v && Array.isArray((v as Record<string, unknown>).whispers)
}

function rowToCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    playerName: row.player_name as string,
    characterName: row.character_name as string,
    class: row.class as string,
    level: row.level as number,
    xp: (row.xp as number) ?? 0,
    maxHp: row.max_hp as number,
    currentHp: row.current_hp as number,
    armorClass: row.armor_class as number,
    deathSaves: (row.death_saves as Character['deathSaves']) ?? { successes: 0, failures: 0 },
    spellSlots: (row.spell_slots as Character['spellSlots']) ?? [],
    conditions: (row.conditions as Character['conditions']) ?? [],
    loot: (row.loot as Character['loot']) ?? [],
    pushSubscription: (row.push_subscription as Character['pushSubscription']) ?? null,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
  }
}
