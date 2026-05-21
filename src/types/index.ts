export interface SpellSlot {
  level: number
  total: number
  used: number
}

export interface Condition {
  name: string
  roundsRemaining: number | null  // null = indefinite
}

export interface Campaign {
  id: string
  code: string
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
}

export type FateEventType = 'attack' | 'curse' | 'windfall' | 'betrayal' | 'mystery'

export interface FateEvent {
  id: string
  campaignId: string
  eventType: FateEventType
  targetCharacterId: string
  revealedAt: Date | null
  dmNote: string | null
  createdAt: Date
}

export interface FatePoolEntry {
  characterId: string
  weight: number
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface InitiativeEntry {
  characterId: string
  initiative: number
  name: string
}

export interface CombatSession {
  id: string
  campaignId: string
  initiativeOrder: InitiativeEntry[]
  currentTurnIndex: number
  roundNumber: number
  isActive: boolean
  createdAt: Date
}

export interface Character {
  id: string
  campaignId: string
  playerName: string
  characterName: string
  class: string
  level: number
  maxHp: number
  currentHp: number
  armorClass: number
  deathSaves: DeathSaves
  spellSlots: SpellSlot[]
  conditions: Condition[]
  pushSubscription: PushSubscriptionJSON | null
  isActive: boolean
  createdAt: Date
}
