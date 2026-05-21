'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/types'

export default function PlayerCampaignPage() {
  const { code } = useParams<{ code: string }>()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCharacter = useCallback(async (campaignId: string) => {
    const characterId = sessionStorage.getItem(`character_${code.toUpperCase()}`)
    if (!characterId) return

    const supabase = createClient()
    const { data } = await supabase
      .from('characters')
      .select()
      .eq('id', characterId)
      .eq('campaign_id', campaignId)
      .single()

    if (data) setCharacter(rowToCharacter(data))
  }, [code])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data } = await supabase
        .from('campaigns')
        .select('id')
        .eq('code', code.toUpperCase())
        .single()

      if (!data) { setLoading(false); return }
      await loadCharacter(data.id as string)
      setLoading(false)
    }
    void init()
  }, [code, loadCharacter])

  // Realtime self-update
  useEffect(() => {
    if (!character) return
    const supabase = createClient()
    const channel = supabase
      .channel(`character:${character.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'characters', filter: `id=eq.${character.id}` },
        payload => {
          if (payload.new) setCharacter(rowToCharacter(payload.new as Record<string, unknown>))
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
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
  const hpColor =
    hpPercent > 50 ? 'bg-emerald-500' :
    hpPercent > 25 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-4">
      <div className="max-w-sm mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{character.characterName}</h1>
          <p className="text-stone-400">{character.playerName} · {character.class} {character.level}</p>
          <p className="font-mono text-stone-500 text-xs mt-0.5">{code.toUpperCase()}</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-stone-400 text-sm">Hit Points</span>
            <div>
              <span className="text-3xl font-bold">{character.currentHp}</span>
              <span className="text-stone-500"> / {character.maxHp}</span>
            </div>
          </div>
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${hpColor}`}
              style={{ width: `${hpPercent}%` }}
            />
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
      </div>
    </main>
  )
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
