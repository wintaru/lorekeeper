'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/types'

export default function DmRosterPage() {
  const { code } = useParams<{ code: string }>()
  const [characters, setCharacters] = useState<Character[]>([])
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRoster = useCallback(async (cid: string) => {
    const res = await fetch(`/api/campaigns/roster?campaignId=${cid}`)
    const data: unknown = await res.json()
    if (isRosterResponse(data)) setCharacters(data.characters)
  }, [])

  // Load campaign + roster
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data } = await supabase
        .from('campaigns')
        .select('id')
        .eq('code', code.toUpperCase())
        .single()

      if (!data) { setLoading(false); return }
      setCampaignId(data.id as string)
      await fetchRoster(data.id as string)
      setLoading(false)
    }
    void init()
  }, [code, fetchRoster])

  // Realtime HP sync
  useEffect(() => {
    if (!campaignId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`roster:${campaignId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'characters', filter: `campaign_id=eq.${campaignId}` },
        () => { void fetchRoster(campaignId) }
      )
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
    <main className="min-h-screen bg-stone-950 text-stone-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Roster</h1>
            <p className="text-stone-400 font-mono mt-0.5">{code.toUpperCase()}</p>
          </div>
          <span className="text-xs text-stone-500 bg-stone-900 px-2 py-1 rounded">
            {characters.length} player{characters.length !== 1 ? 's' : ''}
          </span>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">No players yet</p>
            <p className="text-sm mt-1">Share the campaign code to get started</p>
            <p className="font-mono text-2xl font-bold text-amber-400 mt-4">{code.toUpperCase()}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map(c => (
              <CharacterCard key={c.id} character={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function CharacterCard({ character: c }: { character: Character }) {
  const hpPercent = Math.max(0, (c.currentHp / c.maxHp) * 100)
  const hpColor =
    hpPercent > 50 ? 'bg-emerald-500' :
    hpPercent > 25 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{c.characterName}</p>
          <p className="text-stone-400 text-sm">{c.playerName} · {c.class} {c.level}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-stone-100">{c.currentHp}</span>
          <span className="text-stone-500 text-sm"> / {c.maxHp} HP</span>
        </div>
      </div>

      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${hpColor}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-3 text-sm text-stone-400">
        <span>AC {c.armorClass}</span>
        {c.conditions.length > 0 && (
          <span className="text-amber-400">{c.conditions.map(cn => cn.name).join(', ')}</span>
        )}
      </div>
    </div>
  )
}

function isRosterResponse(value: unknown): value is { characters: Character[] } {
  return typeof value === 'object' && value !== null && 'characters' in value && Array.isArray((value as Record<string, unknown>).characters)
}
