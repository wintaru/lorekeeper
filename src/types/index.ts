export interface SpellSlot {
  level: number
  total: number
  used: number
}

export interface Condition {
  name: string
  roundsRemaining: number | null  // null = indefinite
}

export interface NpcRelationship {
  characterId: string
  relationship: string
}

export interface Npc {
  id: string
  campaignId: string
  name: string
  faction: string | null
  lastLocation: string | null
  notes: string | null
  relationships: NpcRelationship[]
  createdAt: Date
}

export interface Location {
  id: string
  campaignId: string
  name: string
  visited: boolean
  notes: string | null
  createdAt: Date
}

export interface InventoryItem {
  name: string
  quantity: number
  notes: string | null
}

export interface LootItem {
  name: string
  quantity: number
  notes: string | null
}

export interface SessionNote {
  id: string
  campaignId: string
  note: string
  createdAt: Date
}

export interface Campaign {
  id: string
  code: string
  gold: number
  sharedItems: InventoryItem[]
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
  loot: LootItem[]
  pushSubscription: PushSubscriptionJSON | null
  isActive: boolean
  createdAt: Date
}
