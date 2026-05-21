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
  spellSlots: SpellSlot[]
  conditions: Condition[]
  pushSubscription: PushSubscriptionJSON | null
  isActive: boolean
  createdAt: Date
}
