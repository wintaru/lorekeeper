'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character, FateEvent, FateEventType, CombatSession, Condition, DeathSaves } from '@/types'

type Tab = 'roster' | 'combat' | 'fate'

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
  const [combatSession, setCombatSession] = useState<CombatSession | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRoster = useCallback(async (cid: string) => {
    const res = await fetch(`/api/campaigns/roster?campaignId=${cid}`)
    const data: unknown = await res.json()
    if (isRosterResponse(data)) setCharacters(data.characters)
  }, [])

  const fetchCombatSession = useCallback(async (cid: string) => {
    const res = await fetch(`/api/combat/session?campaignId=${cid}`)
    const data: unknown = await res.json()
    if (isCombatSessionResponse(data)) setCombatSession(data.session)
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data } = await supabase.from('campaigns').select('id').eq('code', code.toUpperCase()).single()
      if (!data) { setLoading(false); return }
      const cid = data.id as string
      setCampaignId(cid)
      await Promise.all([fetchRoster(cid), fetchCombatSession(cid)])
      setLoading(false)
    }
    void init()
  }, [code, fetchRoster, fetchCombatSession])

  useEffect(() => {
    if (!campaignId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`dm:${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'characters', filter: `campaign_id=eq.${campaignId}` },
        () => { void fetchRoster(campaignId) })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'combat_sessions', filter: `campaign_id=eq.${campaignId}` },
        () => { void fetchCombatSession(campaignId) })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'combat_sessions', filter: `campaign_id=eq.${campaignId}` },
        () => { void fetchCombatSession(campaignId) })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [campaignId, fetchRoster, fetchCombatSession])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </main>
    )
  }

  const TAB_LABELS: Record<Tab, string> = { roster: 'Roster', combat: 'Combat', fate: 'Fate Engine' }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">DM Panel</h1>
          <p className="text-stone-400 font-mono text-xs">{code.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          {combatSession && (
            <span className="text-xs text-red-400 bg-red-950/50 border border-red-900/50 px-2 py-1 rounded animate-pulse">
              ⚔ R{combatSession.roundNumber}
            </span>
          )}
          <span className="text-xs text-stone-500 bg-stone-900 px-2 py-1 rounded">
            {characters.length} player{characters.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="border-b border-stone-800 flex">
        {(['roster', 'combat', 'fate'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === t
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'roster' && <RosterTab characters={characters} code={code} />}
        {tab === 'combat' && campaignId && (
          <CombatTab
            campaignId={campaignId}
            characters={characters}
            session={combatSession}
            onSessionChange={setCombatSession}
            onRosterRefresh={() => void fetchRoster(campaignId)}
          />
        )}
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
        {c.currentHp === 0 && (
          <span className="text-red-400 text-xs">
            💀 {c.deathSaves.successes}S / {c.deathSaves.failures}F
          </span>
        )}
        {c.pushSubscription && <span className="text-emerald-600 text-xs">● push</span>}
      </div>
    </div>
  )
}

// ── Combat Tab ────────────────────────────────────────────────────────────────

function CombatTab({ campaignId, characters, session, onSessionChange, onRosterRefresh }: {
  campaignId: string
  characters: Character[]
  session: CombatSession | null
  onSessionChange: (s: CombatSession | null) => void
  onRosterRefresh: () => void
}) {
  const [initiativeInputs, setInitiativeInputs] = useState<Record<string, string>>({})
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  const [hpInput, setHpInput] = useState('')
  const [conditionName, setConditionName] = useState('')
  const [conditionRounds, setConditionRounds] = useState('')
  const [showConditionForm, setShowConditionForm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleStartCombat() {
    const order = characters
      .map(c => ({
        characterId: c.id,
        name: c.characterName,
        initiative: parseInt(initiativeInputs[c.id] ?? '0', 10) || 0,
      }))
      .sort((a, b) => b.initiative - a.initiative)
    setLoading(true)
    try {
      const res = await fetch('/api/combat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, initiativeOrder: order }),
      })
      const data: unknown = await res.json()
      if (isStartCombatResponse(data)) onSessionChange(data.session)
    } finally {
      setLoading(false)
    }
  }

  async function handleEndCombat() {
    setLoading(true)
    try {
      await fetch('/api/combat/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      onSessionChange(null)
      setSelectedCharId(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleNextTurn() {
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch('/api/combat/next-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          currentTurnIndex: session.currentTurnIndex,
          initiativeOrderLength: session.initiativeOrder.length,
          roundNumber: session.roundNumber,
        }),
      })
      const data: unknown = await res.json()
      if (isNextTurnResponse(data)) onSessionChange(data.session)
    } finally {
      setLoading(false)
    }
  }

  async function handleHpChange(characterId: string, delta: number, currentHp: number, maxHp: number) {
    const newHp = Math.max(0, Math.min(maxHp, currentHp + delta))
    await fetch('/api/characters/hp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, newHp }),
    })
    setHpInput('')
    onRosterRefresh()
  }

  async function handleAddCondition(characterId: string, currentConditions: Condition[]) {
    if (!conditionName.trim()) return
    const rounds = conditionRounds.trim() ? parseInt(conditionRounds, 10) : null
    const newConditions = [...currentConditions, { name: conditionName.trim(), roundsRemaining: isNaN(rounds as number) ? null : rounds }]
    await fetch('/api/characters/conditions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, conditions: newConditions }),
    })
    setConditionName('')
    setConditionRounds('')
    setShowConditionForm(false)
    onRosterRefresh()
  }

  async function handleRemoveCondition(characterId: string, name: string, currentConditions: Condition[]) {
    const newConditions = currentConditions.filter(c => c.name !== name)
    await fetch('/api/characters/conditions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, conditions: newConditions }),
    })
    onRosterRefresh()
  }

  async function handleDeathSave(characterId: string, type: 'success' | 'failure', current: DeathSaves) {
    const deathSaves: DeathSaves = {
      successes: type === 'success' ? Math.min(3, current.successes + 1) : current.successes,
      failures: type === 'failure' ? Math.min(3, current.failures + 1) : current.failures,
    }
    await fetch('/api/characters/death-saves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, deathSaves }),
    })
    onRosterRefresh()
  }

  async function handleResetDeathSaves(characterId: string) {
    await fetch('/api/characters/death-saves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, deathSaves: { successes: 0, failures: 0 } }),
    })
    onRosterRefresh()
  }

  // ── Setup: no active combat ────────────────────────────────────────────────

  if (!session) {
    if (characters.length === 0) {
      return (
        <div className="text-center py-16 text-stone-500">
          <p>No players yet. Share the campaign code to start.</p>
        </div>
      )
    }
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-stone-300 mb-1">Initiative Order</p>
          <p className="text-xs text-stone-500 mb-4">Enter each character's roll — higher goes first.</p>
          <div className="space-y-2">
            {characters.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{c.characterName}</p>
                  <p className="text-stone-500 text-xs">{c.class} · {c.playerName}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="—"
                  value={initiativeInputs[c.id] ?? ''}
                  onChange={e => setInitiativeInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-16 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-center text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => void handleStartCombat()}
          disabled={loading}
          className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-base"
        >
          {loading ? 'Starting…' : '⚔ Start Combat'}
        </button>
      </div>
    )
  }

  // ── Active combat ──────────────────────────────────────────────────────────

  const currentEntry = session.initiativeOrder[session.currentTurnIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-widest">Round</p>
          <p className="text-4xl font-bold tabular-nums">{session.roundNumber}</p>
        </div>
        <button
          onClick={() => void handleEndCombat()}
          disabled={loading}
          className="text-xs text-stone-500 hover:text-red-400 transition-colors px-3 py-1.5 border border-stone-800 rounded-lg"
        >
          End Combat
        </button>
      </div>

      {currentEntry && (
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-red-400">⚔</span>
          <p className="font-semibold">{currentEntry.name}</p>
          <p className="text-stone-500 text-sm">is acting</p>
        </div>
      )}

      <div className="space-y-2">
        {session.initiativeOrder.map((entry, idx) => {
          const char = characters.find(c => c.id === entry.characterId)
          if (!char) return null
          const isCurrentTurn = idx === session.currentTurnIndex
          const isSelected = selectedCharId === char.id
          const hpPercent = Math.max(0, (char.currentHp / char.maxHp) * 100)
          const hpColor = hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
          const isDowned = char.currentHp === 0

          return (
            <div key={char.id}
              className={`rounded-xl border transition-colors ${isCurrentTurn ? 'border-red-700/60 bg-red-950/20' : 'border-stone-800 bg-stone-900'}`}
            >
              <button
                onClick={() => {
                  setSelectedCharId(isSelected ? null : char.id)
                  setHpInput('')
                  setShowConditionForm(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="text-stone-500 font-mono text-sm w-6 shrink-0 text-center">{entry.initiative}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {isCurrentTurn && <span className="text-red-400 text-xs leading-none">▶</span>}
                    <p className={`font-medium text-sm ${isDowned ? 'text-red-400' : ''}`}>{char.characterName}</p>
                    {isDowned && <span className="text-xs text-red-500 font-semibold">DOWNED</span>}
                    {char.conditions.length > 0 && (
                      <span className="text-xs text-amber-400 truncate">{char.conditions.map(c => c.name).join(', ')}</span>
                    )}
                  </div>
                  <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${hpColor}`} style={{ width: `${hpPercent}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums">{char.currentHp}<span className="text-stone-500 text-xs font-normal">/{char.maxHp}</span></p>
                  <p className="text-stone-500 text-xs">AC {char.armorClass}</p>
                </div>
              </button>

              {isSelected && (
                <div className="px-4 pb-4 space-y-4 border-t border-stone-800/50 pt-3">
                  {/* HP */}
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">HP Adjustment</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="Amount"
                        value={hpInput}
                        onChange={e => setHpInput(e.target.value)}
                        className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => void handleHpChange(char.id, -(parseInt(hpInput, 10) || 0), char.currentHp, char.maxHp)}
                        className="bg-red-900 hover:bg-red-800 text-red-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Dmg
                      </button>
                      <button
                        onClick={() => void handleHpChange(char.id, parseInt(hpInput, 10) || 0, char.currentHp, char.maxHp)}
                        className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Heal
                      </button>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-stone-500 uppercase tracking-wider">Conditions</p>
                      <button
                        onClick={() => setShowConditionForm(v => !v)}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {showConditionForm ? 'Cancel' : '+ Add'}
                      </button>
                    </div>
                    {char.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {char.conditions.map(cond => (
                          <span key={cond.name} className="flex items-center gap-1 text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full">
                            {cond.name}{cond.roundsRemaining !== null ? ` (${cond.roundsRemaining}r)` : ''}
                            <button
                              onClick={() => void handleRemoveCondition(char.id, cond.name, char.conditions)}
                              className="text-amber-500 hover:text-red-400 ml-0.5 leading-none"
                            >×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    {!showConditionForm && char.conditions.length === 0 && (
                      <p className="text-xs text-stone-600 italic">None</p>
                    )}
                    {showConditionForm && (
                      <div className="flex gap-2">
                        <input
                          placeholder="e.g. Poisoned"
                          value={conditionName}
                          onChange={e => setConditionName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') void handleAddCondition(char.id, char.conditions) }}
                          className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="number"
                          placeholder="Rounds"
                          min={1}
                          value={conditionRounds}
                          onChange={e => setConditionRounds(e.target.value)}
                          className="w-20 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => void handleAddCondition(char.id, char.conditions)}
                          className="bg-amber-700 hover:bg-amber-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                        >Add</button>
                      </div>
                    )}
                  </div>

                  {/* Death Saves */}
                  {isDowned && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-stone-500 uppercase tracking-wider">Death Saves</p>
                        <button
                          onClick={() => void handleResetDeathSaves(char.id)}
                          className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                        >Reset</button>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-emerald-500 w-4">S</span>
                          {[0, 1, 2].map(i => (
                            <button key={i}
                              onClick={() => void handleDeathSave(char.id, 'success', char.deathSaves)}
                              className={`w-6 h-6 rounded-full border-2 transition-colors ${i < char.deathSaves.successes ? 'bg-emerald-500 border-emerald-400' : 'border-stone-600 bg-stone-800'}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-500 w-4">F</span>
                          {[0, 1, 2].map(i => (
                            <button key={i}
                              onClick={() => void handleDeathSave(char.id, 'failure', char.deathSaves)}
                              className={`w-6 h-6 rounded-full border-2 transition-colors ${i < char.deathSaves.failures ? 'bg-red-500 border-red-400' : 'border-stone-600 bg-stone-800'}`}
                            />
                          ))}
                        </div>
                        {char.deathSaves.successes >= 3 && <span className="text-xs text-emerald-400 font-medium">Stable!</span>}
                        {char.deathSaves.failures >= 3 && <span className="text-xs text-red-400 font-medium">Dead</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => void handleNextTurn()}
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? '…' : 'Next Turn →'}
      </button>
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

          <button onClick={() => void handleDraw()} disabled={loading || characters.length === 0}
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
          <button onClick={() => void handleReveal()} disabled={loading}
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
function isCombatSessionResponse(v: unknown): v is { session: CombatSession | null } {
  return typeof v === 'object' && v !== null && 'session' in v
}
function isStartCombatResponse(v: unknown): v is { session: CombatSession } {
  return typeof v === 'object' && v !== null && 'session' in v && (v as Record<string, unknown>).session !== null
}
function isNextTurnResponse(v: unknown): v is { session: CombatSession } {
  return typeof v === 'object' && v !== null && 'session' in v && (v as Record<string, unknown>).session !== null
}
