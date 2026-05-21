'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character, FateEvent, FateEventType } from '@/types'

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
  const [loading, setLoading] = useState(true)
  const [pushStatus, setPushStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle')
  const [fateToast, setFateToast] = useState<FateEventType | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Load fate log once character is known
  useEffect(() => {
    if (!character || !campaignId) return
    void loadFateLog(campaignId, character.id)
  }, [character?.id, campaignId, loadFateLog])

  // Realtime: HP updates, fate draws (toast), fate reveals (log refresh)
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
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [character?.id, campaignId, loadFateLog])

  // Register service worker and subscribe to push
  useEffect(() => {
    if (!character) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported')
      return
    }
    if (character.pushSubscription) {
      setPushStatus('subscribed')
      return
    }
    void subscribeToPush(character.id, setPushStatus)
  }, [character?.id, character?.pushSubscription])

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

        {fateLog.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-stone-500 uppercase tracking-widest">Fate History</p>
            {fateLog.map(e => (
              <div key={e.id} className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm font-medium">{EVENT_LABELS[e.eventType]}</span>
                </div>
                <span className="text-stone-600 text-xs">
                  {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

async function subscribeToPush(
  characterId: string,
  setStatus: (s: 'idle' | 'subscribed' | 'denied' | 'unsupported') => void,
) {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { setStatus('denied'); return }

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

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

function rowToCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    playerName: row.player_name as string,
    characterName: row.character_name as string,
    class: row.class as string,
    level: row.level as number,
    maxHp: row.max_hp as number,
    currentHp: row.current_hp as number,
    armorClass: row.armor_class as number,
    spellSlots: (row.spell_slots as Character['spellSlots']) ?? [],
    conditions: (row.conditions as Character['conditions']) ?? [],
    pushSubscription: (row.push_subscription as Character['pushSubscription']) ?? null,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
  }
}
