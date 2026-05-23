'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Campaign } from '@/types'

export default function DmRejoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRejoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!code.trim()) {
      setError('Campaign code is required')
      return
    }
    if (!pin) {
      setError('PIN is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/campaigns/rejoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignCode: code.trim().toUpperCase(), dmPin: pin }),
      })
      const data: unknown = await res.json()
      if (res.status === 401) {
        setError('Incorrect PIN')
        return
      }
      if (res.status === 404) {
        setError('Campaign not found')
        return
      }
      if (!res.ok || !isCampaignResponse(data)) {
        setError('Something went wrong')
        return
      }
      sessionStorage.setItem(`dm_pin_${data.campaign.code}`, pin)
      router.push(`/dm/campaign/${data.campaign.code}`)
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
          <p className="text-stone-400 mt-1">Rejoin your campaign</p>
        </div>

        <form onSubmit={handleRejoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Campaign Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABCD1234"
              autoCapitalize="characters"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">DM PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Your PIN"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Verifying…' : 'Rejoin Campaign'}
          </button>
        </form>

        <p className="text-center text-stone-500 text-sm">
          <a href="/dm" className="text-amber-400 hover:underline">Start a new campaign instead</a>
        </p>
      </div>
    </main>
  )
}

function isCampaignResponse(value: unknown): value is { campaign: Campaign } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'campaign' in value &&
    typeof (value as Record<string, unknown>).campaign === 'object'
  )
}
