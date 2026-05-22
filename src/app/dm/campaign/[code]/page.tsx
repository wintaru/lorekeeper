'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Character, FateEvent, FateEventType, CombatSession, Condition, DeathSaves, Npc, Location, SessionNote, InventoryItem, LootItem, NpcRelationship, CustomTable } from '@/types'

type Tab = 'roster' | 'combat' | 'fate' | 'world'
type WorldTab = 'npcs' | 'locations' | 'inventory' | 'log' | 'tables'

// D&D 5e XP thresholds — index = level - 1
const XP_THRESHOLDS = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]
function xpToLevel(xp: number) { let l = 1; for (let i = 0; i < 20; i++) { if (xp >= XP_THRESHOLDS[i]) l = i + 1 } return l }
function xpForNextLevel(level: number) { return level >= 20 ? null : XP_THRESHOLDS[level] }

const BUILT_IN_TABLES: Record<string, { label: string; entries: string[] }> = {
  names: { label: 'Fantasy Names', entries: ['Aelindra','Borin','Caelum','Dorvak','Elenara','Fendrel','Galindra','Halgrim','Ilyana','Jorvek','Kira','Lundak','Mirela','Norgrim','Opalind','Pyra','Quelara','Rodvar','Silvara','Thorin','Ulindra','Varek','Windara','Xandrel','Yelara','Zorvak'] },
  weather: { label: 'Weather', entries: ['Clear skies','Partly cloudy','Overcast','Light rain','Heavy rain','Thunderstorm','Dense fog','Light snow','Blizzard','Scorching heat','Gentle breeze','Strong winds','Hailstorm','Sleet','Magical aurora'] },
  encounters: { label: 'Encounter Hooks', entries: ['A merchant is being robbed in broad daylight','An old woman offers a job "too dangerous for adventurers"','Strange lights in the abandoned tower to the north','The innkeeper\'s daughter has gone missing','A wounded soldier stumbles in with no memory','A letter addressed to the party arrives by raven','The local temple is under quarantine','A cart of goods abandoned on the road','Wanted posters bear a resemblance to the party','A traveling carnival arrived overnight','A child claims to have seen a dragon','The road ahead is blocked by a collapsed bridge'] },
  loot: { label: 'Loot', entries: ['2d10 gold pieces','A silver ring (25 gp)','Potion of Healing','A torn map fragment','1d6 gems worth 10 gp each','A mysterious sealed letter','Masterwork longsword','An ivory figurine (50 gp)','Spell scroll (level 1)','A cursed trinket','A pouch of exotic spices (15 gp)','A set of loaded dice'] },
}

type RollEntry = { label: string; result: number | string; timestamp: Date }

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
  const [showDice, setShowDice] = useState(false)
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([])

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

  const TAB_LABELS: Record<Tab, string> = { roster: 'Roster', combat: 'Combat', fate: 'Fate Engine', world: 'World' }

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
          <button onClick={() => setShowDice(v => !v)}
            className={`text-lg px-2 py-1 rounded transition-colors ${showDice ? 'text-amber-400 bg-amber-950/40' : 'text-stone-500 hover:text-stone-300'}`}
            title="Dice roller">🎲</button>
          <span className="text-xs text-stone-500 bg-stone-900 px-2 py-1 rounded">
            {characters.length} player{characters.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="border-b border-stone-800 flex overflow-x-auto">
        {(['roster', 'combat', 'fate', 'world'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === t
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {showDice && (
        <DicePanel
          history={rollHistory}
          onRoll={entry => setRollHistory(prev => [entry, ...prev].slice(0, 20))}
        />
      )}

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'roster' && <RosterTab characters={characters} code={code} onRosterRefresh={() => void fetchRoster(campaignId!)} />}
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
        {tab === 'world' && campaignId && (
          <WorldTab campaignId={campaignId} characters={characters} />
        )}
      </div>
    </main>
  )
}

// ── Roster Tab ────────────────────────────────────────────────────────────────

function RosterTab({ characters, code, onRosterRefresh }: { characters: Character[]; code: string; onRosterRefresh: () => void }) {
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
      {characters.map(c => <CharacterCard key={c.id} character={c} onRefresh={onRosterRefresh} />)}
    </div>
  )
}

function CharacterCard({ character: c, onRefresh }: { character: Character; onRefresh: () => void }) {
  const hpPercent = Math.max(0, (c.currentHp / c.maxHp) * 100)
  const hpColor = hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
  const level = xpToLevel(c.xp)
  const nextXp = xpForNextLevel(level)
  const [xpInput, setXpInput] = useState('')
  const [whisperText, setWhisperText] = useState('')
  const [showWhisper, setShowWhisper] = useState(false)
  const [whisperSent, setWhisperSent] = useState(false)
  const [whisperError, setWhisperError] = useState(false)

  async function handleAwardXp() {
    const amount = parseInt(xpInput, 10)
    if (!amount) return
    await fetch('/api/characters/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId: c.id, xpToAdd: amount }),
    })
    setXpInput(''); onRefresh()
  }

  async function handleWhisper() {
    if (!whisperText.trim()) return
    const res = await fetch('/api/push/whisper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId: c.id, message: whisperText.trim() }),
    })
    if (res.ok) {
      setWhisperText(''); setWhisperSent(true); setWhisperError(false)
      setTimeout(() => { setWhisperSent(false); setShowWhisper(false) }, 2000)
    } else {
      setWhisperError(true)
      setTimeout(() => setWhisperError(false), 3000)
    }
  }

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
      <div className="flex items-center gap-3 text-sm text-stone-400 flex-wrap">
        <span>AC {c.armorClass}</span>
        {c.conditions.length > 0 && (
          <span className="text-amber-400">{c.conditions.map(cn => cn.name).join(', ')}</span>
        )}
        {c.currentHp === 0 && (
          <span className="text-red-400 text-xs">💀 {c.deathSaves.successes}S / {c.deathSaves.failures}F</span>
        )}
        {c.pushSubscription && <span className="text-emerald-600 text-xs">● push</span>}
      </div>

      {/* XP */}
      <div className="border-t border-stone-800/50 pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>{c.xp.toLocaleString()} XP · Level {level}</span>
          {nextXp && <span>{(nextXp - c.xp).toLocaleString()} to next level</span>}
        </div>
        {nextXp && (
          <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-violet-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((c.xp - XP_THRESHOLDS[level - 1]) / (nextXp - XP_THRESHOLDS[level - 1])) * 100)}%` }} />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input type="number" min={1} placeholder="Award XP" value={xpInput}
            onChange={e => setXpInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void handleAwardXp() }}
            className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-violet-500" />
          <button onClick={() => void handleAwardXp()}
            className="bg-violet-800 hover:bg-violet-700 text-violet-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            +XP
          </button>
          {c.pushSubscription && (
            <button onClick={() => setShowWhisper(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showWhisper ? 'border-amber-500 text-amber-400' : 'border-stone-700 text-stone-500 hover:text-stone-300'}`}>
              Whisper
            </button>
          )}
        </div>
        {showWhisper && (
          <div className="flex gap-2">
            <input placeholder="Secret message…" value={whisperText}
              onChange={e => setWhisperText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleWhisper() }}
              className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
            <button onClick={() => void handleWhisper()}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${whisperSent ? 'bg-emerald-800 text-emerald-200' : whisperError ? 'bg-red-900 text-red-300' : 'bg-amber-700 hover:bg-amber-600 text-white'}`}>
              {whisperSent ? 'Sent!' : whisperError ? 'Failed' : 'Send'}
            </button>
          </div>
        )}
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

// ── World Tab ─────────────────────────────────────────────────────────────────

function WorldTab({ campaignId, characters }: { campaignId: string; characters: Character[] }) {
  const [worldTab, setWorldTab] = useState<WorldTab>('npcs')
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([])
  const [gold, setGold] = useState(0)
  const [sharedItems, setSharedItems] = useState<InventoryItem[]>([])

  const fetchNpcs = useCallback(async () => {
    const res = await fetch(`/api/world/npcs?campaignId=${campaignId}`)
    const data: unknown = await res.json()
    if (isNpcsResponse(data)) setNpcs(data.npcs)
  }, [campaignId])

  const fetchLocations = useCallback(async () => {
    const res = await fetch(`/api/world/locations?campaignId=${campaignId}`)
    const data: unknown = await res.json()
    if (isLocationsResponse(data)) setLocations(data.locations)
  }, [campaignId])

  const fetchSessionNotes = useCallback(async () => {
    const res = await fetch(`/api/world/session-notes?campaignId=${campaignId}`)
    const data: unknown = await res.json()
    if (isSessionNotesResponse(data)) setSessionNotes(data.notes)
  }, [campaignId])

  const fetchInventory = useCallback(async () => {
    const res = await fetch(`/api/world/inventory?campaignId=${campaignId}`)
    const data: unknown = await res.json()
    if (isInventoryResponse(data)) { setGold(data.gold); setSharedItems(data.sharedItems) }
  }, [campaignId])

  useEffect(() => {
    void Promise.all([fetchNpcs(), fetchLocations(), fetchSessionNotes(), fetchInventory()])
  }, [fetchNpcs, fetchLocations, fetchSessionNotes, fetchInventory])

  const WORLD_LABELS: Record<WorldTab, string> = { npcs: 'NPCs', locations: 'Locations', inventory: 'Inventory', log: 'Log', tables: 'Tables' }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-stone-900 rounded-lg p-1 overflow-x-auto">
        {(['npcs', 'locations', 'inventory', 'log', 'tables'] as WorldTab[]).map(t => (
          <button key={t} onClick={() => setWorldTab(t)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              worldTab === t ? 'bg-stone-700 text-stone-100' : 'text-stone-500 hover:text-stone-300'
            }`}>
            {WORLD_LABELS[t]}
          </button>
        ))}
      </div>

      {worldTab === 'npcs' && (
        <NpcsSection campaignId={campaignId} characters={characters} npcs={npcs} onRefresh={fetchNpcs} />
      )}
      {worldTab === 'locations' && (
        <LocationsSection campaignId={campaignId} locations={locations} onRefresh={fetchLocations} />
      )}
      {worldTab === 'inventory' && (
        <InventorySection
          campaignId={campaignId} characters={characters}
          gold={gold} sharedItems={sharedItems}
          onRefresh={fetchInventory}
        />
      )}
      {worldTab === 'log' && (
        <SessionLogSection campaignId={campaignId} notes={sessionNotes} onRefresh={fetchSessionNotes} />
      )}
      {worldTab === 'tables' && (
        <TablesSection campaignId={campaignId} />
      )}
    </div>
  )
}

// ── NPCs Section ──────────────────────────────────────────────────────────────

function NpcsSection({ campaignId, characters, npcs, onRefresh }: {
  campaignId: string; characters: Character[]; npcs: Npc[]; onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', faction: '', lastLocation: '', notes: '', relationships: {} as Record<string, string> })

  function resetForm() {
    setForm({ name: '', faction: '', lastLocation: '', notes: '', relationships: {} })
  }

  async function handleAdd() {
    if (!form.name.trim()) return
    const relationships: NpcRelationship[] = characters
      .filter(c => form.relationships[c.id]?.trim())
      .map(c => ({ characterId: c.id, relationship: form.relationships[c.id].trim() }))
    await fetch('/api/world/npcs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, name: form.name.trim(), faction: form.faction || null, lastLocation: form.lastLocation || null, notes: form.notes || null, relationships }),
    })
    resetForm(); setShowForm(false); onRefresh()
  }

  async function handleEdit(npc: Npc) {
    const relationships: NpcRelationship[] = characters
      .filter(c => form.relationships[c.id]?.trim())
      .map(c => ({ characterId: c.id, relationship: form.relationships[c.id].trim() }))
    await fetch(`/api/world/npcs/${npc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.trim(), faction: form.faction || null, lastLocation: form.lastLocation || null, notes: form.notes || null, relationships }),
    })
    setEditingId(null); onRefresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/world/npcs/${id}`, { method: 'DELETE' })
    if (expandedId === id) setExpandedId(null)
    onRefresh()
  }

  function startEdit(npc: Npc) {
    const rel: Record<string, string> = {}
    npc.relationships.forEach(r => { rel[r.characterId] = r.relationship })
    setForm({ name: npc.name, faction: npc.faction ?? '', lastLocation: npc.lastLocation ?? '', notes: npc.notes ?? '', relationships: rel })
    setEditingId(npc.id)
    setExpandedId(npc.id)
  }

  return (
    <div className="space-y-3">
      {npcs.map(npc => (
        <div key={npc.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <button onClick={() => setExpandedId(expandedId === npc.id ? null : npc.id)}
            className="w-full flex items-start justify-between px-4 py-3 text-left">
            <div>
              <p className="font-medium">{npc.name}</p>
              <p className="text-stone-500 text-xs mt-0.5">
                {[npc.faction, npc.lastLocation].filter(Boolean).join(' · ') || 'No details'}
              </p>
            </div>
            <span className="text-stone-600 text-xs mt-1">{expandedId === npc.id ? '▲' : '▼'}</span>
          </button>

          {expandedId === npc.id && (
            <div className="border-t border-stone-800 px-4 py-3 space-y-3">
              {editingId === npc.id ? (
                <NpcForm form={form} setForm={setForm} characters={characters}
                  onSave={() => void handleEdit(npc)} onCancel={() => setEditingId(null)} saveLabel="Save" />
              ) : (
                <>
                  {npc.notes && (
                    <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2">
                      <p className="text-xs text-amber-500 mb-1">DM Notes</p>
                      <p className="text-sm text-stone-300 whitespace-pre-wrap">{npc.notes}</p>
                    </div>
                  )}
                  {npc.relationships.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-500 mb-2">Relationships</p>
                      <div className="space-y-1">
                        {npc.relationships.map(r => {
                          const char = characters.find(c => c.id === r.characterId)
                          return char ? (
                            <div key={r.characterId} className="flex gap-2 text-sm">
                              <span className="text-stone-400 shrink-0">{char.characterName}:</span>
                              <span className="text-stone-300">{r.relationship}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => startEdit(npc)} className="text-xs text-stone-400 hover:text-stone-200 transition-colors">Edit</button>
                    <button onClick={() => void handleDelete(npc.id)} className="text-xs text-red-600 hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-4">
          <p className="text-sm font-medium text-stone-300 mb-3">Add NPC</p>
          <NpcForm form={form} setForm={setForm} characters={characters}
            onSave={() => void handleAdd()} onCancel={() => { resetForm(); setShowForm(false) }} saveLabel="Add" />
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full border border-dashed border-stone-700 rounded-xl py-3 text-sm text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-colors">
          + Add NPC
        </button>
      )}
    </div>
  )
}

function NpcForm({ form, setForm, characters, onSave, onCancel, saveLabel }: {
  form: { name: string; faction: string; lastLocation: string; notes: string; relationships: Record<string, string> }
  setForm: React.Dispatch<React.SetStateAction<typeof form>>
  characters: Character[]
  onSave: () => void
  onCancel: () => void
  saveLabel: string
}) {
  return (
    <div className="space-y-3">
      <input placeholder="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Faction" value={form.faction} onChange={e => setForm(p => ({ ...p, faction: e.target.value }))}
          className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
        <input placeholder="Last location" value={form.lastLocation} onChange={e => setForm(p => ({ ...p, lastLocation: e.target.value }))}
          className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
      </div>
      <textarea placeholder="DM notes / secrets" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none" />
      {characters.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 mb-2">Relationships</p>
          <div className="space-y-1.5">
            {characters.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-xs text-stone-400 w-24 shrink-0 truncate">{c.characterName}</span>
                <input placeholder="Relationship…" value={form.relationships[c.id] ?? ''}
                  onChange={e => setForm(p => ({ ...p, relationships: { ...p.relationships, [c.id]: e.target.value } }))}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">{saveLabel}</button>
        <button onClick={onCancel} className="px-4 text-stone-500 hover:text-stone-300 text-sm transition-colors">Cancel</button>
      </div>
    </div>
  )
}

// ── Locations Section ─────────────────────────────────────────────────────────

function LocationsSection({ campaignId, locations, onRefresh }: {
  campaignId: string; locations: Location[]; onRefresh: () => void
}) {
  const [newName, setNewName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})

  async function handleAdd() {
    if (!newName.trim()) return
    await fetch('/api/world/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, name: newName.trim() }),
    })
    setNewName(''); onRefresh()
  }

  async function handleToggleVisited(loc: Location) {
    await fetch(`/api/world/locations/${loc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visited: !loc.visited, notes: loc.notes }),
    })
    onRefresh()
  }

  async function handleSaveNotes(loc: Location) {
    await fetch(`/api/world/locations/${loc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visited: loc.visited, notes: editingNotes[loc.id] ?? loc.notes ?? '' }),
    })
    onRefresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/world/locations/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div className="space-y-2">
      {locations.map(loc => (
        <div key={loc.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => void handleToggleVisited(loc)}
              className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${loc.visited ? 'bg-emerald-600 border-emerald-500' : 'border-stone-600'}`}>
              {loc.visited && <span className="text-white text-xs leading-none">✓</span>}
            </button>
            <button onClick={() => {
              setExpandedId(expandedId === loc.id ? null : loc.id)
              if (!editingNotes[loc.id]) setEditingNotes(p => ({ ...p, [loc.id]: loc.notes ?? '' }))
            }} className="flex-1 text-left">
              <p className={`text-sm font-medium ${loc.visited ? 'text-stone-400' : 'text-stone-100'}`}>{loc.name}</p>
              {loc.notes && <p className="text-xs text-stone-600 truncate mt-0.5">{loc.notes}</p>}
            </button>
            <button onClick={() => void handleDelete(loc.id)} className="text-stone-700 hover:text-red-500 text-xs transition-colors">✕</button>
          </div>
          {expandedId === loc.id && (
            <div className="border-t border-stone-800 px-4 py-3 space-y-2">
              <textarea
                placeholder="Notes…"
                rows={3}
                value={editingNotes[loc.id] ?? loc.notes ?? ''}
                onChange={e => setEditingNotes(p => ({ ...p, [loc.id]: e.target.value }))}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
              />
              <button onClick={() => void handleSaveNotes(loc)}
                className="text-xs bg-stone-700 hover:bg-stone-600 text-stone-200 px-3 py-1.5 rounded-lg transition-colors">
                Save notes
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <input placeholder="New location…" value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void handleAdd() }}
          className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
        <button onClick={() => void handleAdd()}
          className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm px-4 py-2.5 rounded-xl transition-colors">
          Add
        </button>
      </div>
    </div>
  )
}

// ── Inventory Section ─────────────────────────────────────────────────────────

function InventorySection({ campaignId, characters, gold, sharedItems, onRefresh }: {
  campaignId: string; characters: Character[]; gold: number; sharedItems: InventoryItem[]; onRefresh: () => void
}) {
  const [goldInput, setGoldInput] = useState('')
  const [editingGold, setEditingGold] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', notes: '' })
  const [showItemForm, setShowItemForm] = useState(false)
  const [lootInputs, setLootInputs] = useState<Record<string, { name: string; quantity: string }>>({})
  const [expandedChar, setExpandedChar] = useState<string | null>(null)

  async function handleGoldUpdate(delta?: number) {
    const newGold = delta !== undefined ? Math.max(0, gold + delta) : Math.max(0, parseInt(goldInput, 10) || 0)
    await fetch('/api/world/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, gold: newGold, sharedItems }),
    })
    setEditingGold(false); setGoldInput(''); onRefresh()
  }

  async function handleAddItem() {
    if (!newItem.name.trim()) return
    const item: InventoryItem = { name: newItem.name.trim(), quantity: parseInt(newItem.quantity, 10) || 1, notes: newItem.notes || null }
    await fetch('/api/world/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, gold, sharedItems: [...sharedItems, item] }),
    })
    setNewItem({ name: '', quantity: '1', notes: '' }); setShowItemForm(false); onRefresh()
  }

  async function handleRemoveItem(idx: number) {
    const updated = sharedItems.filter((_, i) => i !== idx)
    await fetch('/api/world/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, gold, sharedItems: updated }),
    })
    onRefresh()
  }

  async function handleAddLoot(char: Character) {
    const input = lootInputs[char.id]
    if (!input?.name?.trim()) return
    const item: LootItem = { name: input.name.trim(), quantity: parseInt(input.quantity, 10) || 1, notes: null }
    await fetch('/api/world/character-loot', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId: char.id, loot: [...char.loot, item] }),
    })
    setLootInputs(p => ({ ...p, [char.id]: { name: '', quantity: '1' } })); onRefresh()
  }

  async function handleRemoveLoot(char: Character, idx: number) {
    const updated = char.loot.filter((_, i) => i !== idx)
    await fetch('/api/world/character-loot', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId: char.id, loot: updated }),
    })
    onRefresh()
  }

  return (
    <div className="space-y-5">
      {/* Gold */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">Party Gold</p>
        <div className="flex items-center gap-3">
          <button onClick={() => void handleGoldUpdate(-10)} className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors">−10</button>
          <button onClick={() => void handleGoldUpdate(-1)} className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors">−1</button>
          {editingGold ? (
            <input type="number" value={goldInput} onChange={e => setGoldInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleGoldUpdate() }}
              onBlur={() => void handleGoldUpdate()}
              autoFocus
              className="flex-1 bg-stone-800 border border-amber-500 rounded-lg px-3 py-1.5 text-center text-xl font-bold font-mono focus:outline-none" />
          ) : (
            <button onClick={() => { setGoldInput(String(gold)); setEditingGold(true) }}
              className="flex-1 text-center text-3xl font-bold text-amber-400 tabular-nums">
              {gold.toLocaleString()} <span className="text-xs text-stone-500 font-normal">gp</span>
            </button>
          )}
          <button onClick={() => void handleGoldUpdate(1)} className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors">+1</button>
          <button onClick={() => void handleGoldUpdate(10)} className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-colors">+10</button>
        </div>
      </div>

      {/* Shared items */}
      <div>
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Shared Items</p>
        <div className="space-y-1.5">
          {sharedItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg px-3 py-2">
              <span className="text-stone-500 text-xs font-mono w-6 text-center">{item.quantity}×</span>
              <span className="flex-1 text-sm">{item.name}</span>
              {item.notes && <span className="text-xs text-stone-500">{item.notes}</span>}
              <button onClick={() => void handleRemoveItem(idx)} className="text-stone-700 hover:text-red-500 text-xs transition-colors">✕</button>
            </div>
          ))}
          {sharedItems.length === 0 && !showItemForm && (
            <p className="text-xs text-stone-600 italic px-1">No shared items</p>
          )}
        </div>
        {showItemForm ? (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input placeholder="Item name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
              <input type="number" min={1} placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
                className="w-16 bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-sm text-center font-mono focus:outline-none focus:border-amber-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => void handleAddItem()} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-sm py-2 rounded-lg transition-colors">Add</button>
              <button onClick={() => setShowItemForm(false)} className="text-stone-500 hover:text-stone-300 text-sm px-3 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowItemForm(true)}
            className="mt-2 text-xs text-stone-500 hover:text-amber-400 transition-colors">
            + Add item
          </button>
        )}
      </div>

      {/* Character loot */}
      {characters.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Individual Loot</p>
          <div className="space-y-2">
            {characters.map(char => (
              <div key={char.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <button onClick={() => setExpandedChar(expandedChar === char.id ? null : char.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{char.characterName}</span>
                    {char.loot.length > 0 && (
                      <span className="text-xs text-stone-500">{char.loot.length} item{char.loot.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <span className="text-stone-600 text-xs">{expandedChar === char.id ? '▲' : '▼'}</span>
                </button>
                {expandedChar === char.id && (
                  <div className="border-t border-stone-800 px-4 py-3 space-y-2">
                    {char.loot.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-stone-500 font-mono text-xs">{item.quantity}×</span>
                        <span className="flex-1">{item.name}</span>
                        <button onClick={() => void handleRemoveLoot(char, idx)} className="text-stone-700 hover:text-red-500 text-xs transition-colors">✕</button>
                      </div>
                    ))}
                    {char.loot.length === 0 && <p className="text-xs text-stone-600 italic">No loot</p>}
                    <div className="flex gap-2 pt-1">
                      <input placeholder="Item name" value={lootInputs[char.id]?.name ?? ''}
                        onChange={e => setLootInputs(p => ({ ...p, [char.id]: { ...p[char.id], name: e.target.value } }))}
                        className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
                      <input type="number" min={1} placeholder="Qty" value={lootInputs[char.id]?.quantity ?? '1'}
                        onChange={e => setLootInputs(p => ({ ...p, [char.id]: { ...p[char.id], quantity: e.target.value } }))}
                        className="w-14 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1.5 text-sm text-center font-mono focus:outline-none focus:border-amber-500" />
                      <button onClick={() => void handleAddLoot(char)}
                        className="bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm px-3 py-1.5 rounded-lg transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Session Log Section ───────────────────────────────────────────────────────

function SessionLogSection({ campaignId, notes, onRefresh }: {
  campaignId: string; notes: SessionNote[]; onRefresh: () => void
}) {
  const [noteText, setNoteText] = useState('')

  async function handleAdd() {
    if (!noteText.trim()) return
    await fetch('/api/world/session-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, note: noteText.trim() }),
    })
    setNoteText(''); onRefresh()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/world/session-notes/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          placeholder="Add a session note…"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          rows={3}
          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 resize-none"
        />
        <button onClick={() => void handleAdd()} disabled={!noteText.trim()}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Add Note
        </button>
      </div>

      <div className="space-y-2">
        {notes.length === 0 && <p className="text-xs text-stone-600 italic">No notes yet.</p>}
        {notes.map(n => (
          <div key={n.id} className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 flex gap-3">
            <div className="flex-1">
              <p className="text-sm text-stone-200 whitespace-pre-wrap">{n.note}</p>
              <p className="text-xs text-stone-600 mt-2">
                {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button onClick={() => void handleDelete(n.id)} className="text-stone-700 hover:text-red-500 text-xs shrink-0 transition-colors">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Type guards ───────────────────────────────────────────────────────────────

// ── Dice Panel ────────────────────────────────────────────────────────────────

function rollExpression(expr: string): number | null {
  const m = expr.trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!m) return null
  let total = m[3] ? parseInt(m[3]) : 0
  const sides = parseInt(m[2])
  for (let i = 0; i < parseInt(m[1]); i++) total += Math.floor(Math.random() * sides) + 1
  return total
}

function DicePanel({ history, onRoll }: { history: RollEntry[]; onRoll: (e: RollEntry) => void }) {
  const [custom, setCustom] = useState('')
  const STD = [4, 6, 8, 10, 12, 20, 100]

  function roll(label: string, expr: string) {
    const result = rollExpression(expr)
    if (result !== null) onRoll({ label, result, timestamp: new Date() })
  }

  function rollCustom() {
    const expr = custom.trim()
    if (!expr) return
    const result = rollExpression(expr) ?? `Invalid: ${expr}`
    onRoll({ label: expr, result, timestamp: new Date() })
  }

  return (
    <div className="border-b border-stone-800 bg-stone-950/80 px-4 py-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {STD.map(d => (
          <button key={d} onClick={() => roll(`d${d}`, `1d${d}`)}
            className="bg-stone-800 hover:bg-amber-700 text-stone-200 text-sm font-bold w-12 h-10 rounded-lg transition-colors">
            d{d}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input placeholder="e.g. 2d6+3" value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') rollCustom() }}
          className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
        <button onClick={rollCustom}
          className="bg-amber-700 hover:bg-amber-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">Roll</button>
      </div>
      {history.length > 0 && (
        <div className="flex gap-2 flex-wrap max-h-16 overflow-y-auto">
          {history.map((e, i) => (
            <span key={i} className="text-xs bg-stone-800 text-stone-300 px-2 py-1 rounded-lg font-mono">
              <span className="text-stone-500">{e.label}:</span> <span className="text-amber-400 font-bold">{e.result}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tables Section ────────────────────────────────────────────────────────────

function TablesSection({ campaignId }: { campaignId: string }) {
  const [customTables, setCustomTables] = useState<CustomTable[]>([])
  const [lastRoll, setLastRoll] = useState<{ table: string; result: string } | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEntries, setNewEntries] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEntries, setEditEntries] = useState('')

  const fetchTables = useCallback(async () => {
    const res = await fetch(`/api/world/tables?campaignId=${campaignId}`)
    const data: unknown = await res.json()
    if (isCustomTablesResponse(data)) setCustomTables(data.tables)
  }, [campaignId])

  useEffect(() => { void fetchTables() }, [fetchTables])

  function rollTable(name: string, entries: string[]) {
    if (entries.length === 0) return
    const result = entries[Math.floor(Math.random() * entries.length)]
    setLastRoll({ table: name, result })
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const entries = newEntries.split('\n').map(e => e.trim()).filter(Boolean)
    await fetch('/api/world/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, name: newName.trim(), entries }),
    })
    setNewName(''); setNewEntries(''); setShowNewForm(false); void fetchTables()
  }

  async function handleEdit(t: CustomTable) {
    const entries = editEntries.split('\n').map(e => e.trim()).filter(Boolean)
    await fetch(`/api/world/tables/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), entries }),
    })
    setEditingId(null); void fetchTables()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/world/tables/${id}`, { method: 'DELETE' })
    void fetchTables()
  }

  return (
    <div className="space-y-4">
      {lastRoll && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 uppercase tracking-widest">{lastRoll.table}</p>
            <p className="font-semibold text-amber-300 mt-0.5">{lastRoll.result}</p>
          </div>
          <button onClick={() => setLastRoll(null)} className="text-stone-600 hover:text-stone-400 text-xs">✕</button>
        </div>
      )}

      <div>
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Built-in Tables</p>
        <div className="space-y-2">
          {Object.entries(BUILT_IN_TABLES).map(([key, t]) => (
            <div key={key} className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-stone-500">{t.entries.length} entries</p>
              </div>
              <button onClick={() => rollTable(t.label, t.entries)}
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                Roll
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">Custom Tables</p>
        <div className="space-y-2">
          {customTables.map(t => (
            <div key={t.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
              {editingId === t.id ? (
                <div className="px-4 py-3 space-y-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
                  <textarea value={editEntries} onChange={e => setEditEntries(e.target.value)} rows={4}
                    placeholder="One entry per line"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none font-mono" />
                  <div className="flex gap-2">
                    <button onClick={() => void handleEdit(t)} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-sm py-1.5 rounded-lg transition-colors">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-stone-500 hover:text-stone-300 text-sm px-3 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-stone-500">{t.entries.length} entries</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => rollTable(t.name, t.entries)}
                      className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Roll</button>
                    <button onClick={() => { setEditingId(t.id); setEditName(t.name); setEditEntries(t.entries.join('\n')) }}
                      className="text-stone-500 hover:text-stone-300 text-xs transition-colors">Edit</button>
                    <button onClick={() => void handleDelete(t.id)} className="text-stone-600 hover:text-red-500 text-xs transition-colors">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showNewForm ? (
          <div className="mt-2 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 space-y-2">
            <input placeholder="Table name" value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
            <textarea placeholder="One entry per line" value={newEntries} onChange={e => setNewEntries(e.target.value)} rows={5}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none font-mono" />
            <div className="flex gap-2">
              <button onClick={() => void handleCreate()} className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-sm py-1.5 rounded-lg transition-colors">Create</button>
              <button onClick={() => { setShowNewForm(false); setNewName(''); setNewEntries('') }} className="text-stone-500 hover:text-stone-300 text-sm px-3 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowNewForm(true)}
            className="mt-2 w-full border border-dashed border-stone-700 rounded-xl py-3 text-sm text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-colors">
            + New custom table
          </button>
        )}
      </div>
    </div>
  )
}

function isCustomTablesResponse(v: unknown): v is { tables: CustomTable[] } {
  return typeof v === 'object' && v !== null && 'tables' in v && Array.isArray((v as Record<string, unknown>).tables)
}

function isNpcsResponse(v: unknown): v is { npcs: Npc[] } {
  return typeof v === 'object' && v !== null && 'npcs' in v && Array.isArray((v as Record<string, unknown>).npcs)
}
function isLocationsResponse(v: unknown): v is { locations: Location[] } {
  return typeof v === 'object' && v !== null && 'locations' in v && Array.isArray((v as Record<string, unknown>).locations)
}
function isSessionNotesResponse(v: unknown): v is { notes: SessionNote[] } {
  return typeof v === 'object' && v !== null && 'notes' in v && Array.isArray((v as Record<string, unknown>).notes)
}
function isInventoryResponse(v: unknown): v is { gold: number; sharedItems: InventoryItem[] } {
  return typeof v === 'object' && v !== null && 'gold' in v && 'sharedItems' in v
}
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
