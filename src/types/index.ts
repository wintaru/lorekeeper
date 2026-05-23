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

export interface CustomCurrencyEntry {
  name: string
  amount: number
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
  silver: number
  copper: number
  customCurrency: CustomCurrencyEntry[]
  sharedItems: InventoryItem[]
  mapAccessGranted: boolean
  sharedMapIds: string[]
  mapViewport: MapViewport | null
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
}

export type MapType = 'town' | 'city' | 'world' | 'dungeon'

export interface CampaignMap {
  id: string
  campaignId: string
  name: string
  type: MapType
  storagePath: string
  imageUrl: string
  createdAt: Date
}

export interface MapViewportPoint {
  x: number
  y: number
}

export interface MapViewport {
  mapId: string
  shape: 'rect' | 'circle' | 'polygon'
  // rect: top-left corner + size (all 0–1 normalized)
  x?: number
  y?: number
  width?: number
  height?: number
  // circle: center + radius (0–1 normalized)
  cx?: number
  cy?: number
  r?: number
  // polygon: ordered point list (0–1 normalized)
  points?: MapViewportPoint[]
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
  xp: number
  maxHp: number
  currentHp: number
  armorClass: number
  deathSaves: DeathSaves
  spellSlots: SpellSlot[]
  conditions: Condition[]
  loot: LootItem[]
  gold: number
  silver: number
  copper: number
  customCurrency: CustomCurrencyEntry[]
  pushSubscription: PushSubscriptionJSON | null
  isActive: boolean
  createdAt: Date
}

export interface Whisper {
  id: string
  characterId: string
  message: string
  createdAt: Date
}

export interface InitiativeRequest {
  id: string
  campaignId: string
  status: 'pending' | 'resolved'
  rolls: Record<string, number>
  createdAt: Date
}

export interface CustomTable {
  id: string
  campaignId: string
  name: string
  entries: string[]
  createdAt: Date
}

export type DamageType =
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force'
  | 'lightning' | 'necrotic' | 'piercing' | 'poison'
  | 'psychic' | 'radiant' | 'slashing' | 'thunder'

export type ConditionImmunityType =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion'
  | 'frightened' | 'grappled' | 'incapacitated' | 'invisible'
  | 'paralyzed' | 'petrified' | 'poisoned' | 'prone'
  | 'restrained' | 'stunned' | 'unconscious'

export interface MonsterAbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface Monster {
  name: string
  cr: string
  hp: number
  ac: number
  speed: string
  abilityScores: MonsterAbilityScores
  skills: string
  damageImmunities: DamageType[]
  conditionImmunities: ConditionImmunityType[]
  senses: string
  legendaryActions: boolean
  lairActions: boolean
  legendaryResistance: boolean
}

export interface MonsterGroup {
  id: string
  monster: Monster
  count: number
}

export interface EncounterBreakdown {
  xpScore: number
  acPenalty: number
  immunityBonus: number
  hpPenalty: number
  specialBonus: number
  adjustedXP: number
  partyDeadlyThreshold: number
}

export interface EncounterDifficulty {
  score: number
  label: string
  colorClass: string
  breakdown: EncounterBreakdown
}

export type QuestStatus = 'draft' | 'active' | 'completed'

export interface Quest {
  id: string
  campaignId: string
  title: string
  description: string | null
  giver: string | null
  objective: string | null
  location: string | null
  complications: string | null
  reward: string | null
  difficulty: number
  questType: string | null
  isOptional: boolean
  isPublic: boolean
  status: QuestStatus
  createdAt: Date
}
