'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Character, Campaign } from '@/types'

const D_AND_D_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard', 'Artificer', 'Blood Hunter',
]

export default function PlayerJoinPage() {
  const router = useRouter()
  const [step, setStep] = useState<'code' | 'character'>('code')
  const [campaignCode, setCampaignCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [level, setLevel] = useState(1)
  const [maxHp, setMaxHp] = useState(10)
  const [armorClass, setArmorClass] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (campaignCode.trim().length < 3) {
      setError('Enter a valid campaign code')
      return
    }
    setError(null)
    setStep('character')
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/campaigns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignCode: campaignCode.trim().toUpperCase(),
          playerName,
          characterName,
          characterClass,
          level,
          maxHp,
          armorClass,
        }),
      })

      const data: unknown = await res.json()
      if (!res.ok || !isJoinResponse(data)) {
        setError(isErrorResponse(data) ? data.error : 'Failed to join campaign')
        return
      }

      sessionStorage.setItem(`character_${data.campaign.code}`, data.character.id)
      router.push(`/play/campaign/${data.campaign.code}`)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LoreKeeper</h1>
          <p className="text-stone-400 mt-1">
            {step === 'code' ? 'Enter your campaign code' : 'Create your character'}
          </p>
        </div>

        {step === 'code' ? (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Campaign Code</label>
              <input
                type="text"
                value={campaignCode}
                onChange={e => setCampaignCode(e.target.value.toUpperCase())}
                placeholder="e.g. WOLF-KEEP-42"
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 font-mono placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Player name"
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Character Name</label>
              <input
                type="text"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="Your character's name"
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Class</label>
              <select
                value={characterClass}
                onChange={e => setCharacterClass(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select class…</option>
                {D_AND_D_CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Level</label>
                <input
                  type="number"
                  value={level}
                  min={1}
                  max={20}
                  onChange={e => setLevel(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Max HP</label>
                <input
                  type="number"
                  value={maxHp}
                  min={1}
                  onChange={e => setMaxHp(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">AC</label>
                <input
                  type="number"
                  value={armorClass}
                  min={1}
                  onChange={e => setArmorClass(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Joining…' : 'Join Campaign'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

function isJoinResponse(value: unknown): value is { character: Character; campaign: Campaign } {
  return typeof value === 'object' && value !== null && 'character' in value && 'campaign' in value
}

function isErrorResponse(value: unknown): value is { error: string } {
  return typeof value === 'object' && value !== null && 'error' in value && typeof (value as Record<string, unknown>).error === 'string'
}
