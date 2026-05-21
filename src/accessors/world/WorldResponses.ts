import { ResponseBase } from '@/common/ResponseBase'
import type { Npc, Location, SessionNote, InventoryItem } from '@/types'

export class StoreNpcResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly npc: Npc | null

  constructor(correlationId: string, npc: Npc | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.npc = npc
    this.success = npc !== null
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadNpcsResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly npcs: Npc[]

  constructor(correlationId: string, npcs: Npc[], errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.npcs = npcs
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class RemoveNpcResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class StoreLocationResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly location: Location | null

  constructor(correlationId: string, location: Location | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.location = location
    this.success = location !== null
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadLocationsResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly locations: Location[]

  constructor(correlationId: string, locations: Location[], errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.locations = locations
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class RemoveLocationResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class StoreSessionNoteResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly note: SessionNote | null

  constructor(correlationId: string, note: SessionNote | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.note = note
    this.success = note !== null
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadSessionNotesResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly notes: SessionNote[]

  constructor(correlationId: string, notes: SessionNote[], errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.notes = notes
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class RemoveSessionNoteResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class UpdateCampaignInventoryResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadCampaignInventoryResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly gold: number
  readonly sharedItems: InventoryItem[]

  constructor(correlationId: string, gold: number, sharedItems: InventoryItem[], errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.gold = gold
    this.sharedItems = sharedItems
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class UpdateCharacterLootResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}
