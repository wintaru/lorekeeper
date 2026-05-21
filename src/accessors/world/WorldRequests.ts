import { RequestBase } from '@/common/RequestBase'
import type { NpcRelationship, InventoryItem, LootItem } from '@/types'

export class StoreNpcRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly name: string,
    public readonly faction: string | null = null,
    public readonly lastLocation: string | null = null,
    public readonly notes: string | null = null,
    public readonly relationships: NpcRelationship[] = [],
  ) { super() }
}

export class UpdateNpcRequest extends RequestBase {
  constructor(
    public readonly npcId: string,
    public readonly name: string,
    public readonly faction: string | null = null,
    public readonly lastLocation: string | null = null,
    public readonly notes: string | null = null,
    public readonly relationships: NpcRelationship[] = [],
  ) { super() }
}

export class LoadNpcsRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class RemoveNpcRequest extends RequestBase {
  constructor(public readonly npcId: string) { super() }
}

export class StoreLocationRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly name: string,
  ) { super() }
}

export class UpdateLocationRequest extends RequestBase {
  constructor(
    public readonly locationId: string,
    public readonly visited: boolean,
    public readonly notes: string | null = null,
  ) { super() }
}

export class LoadLocationsRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class RemoveLocationRequest extends RequestBase {
  constructor(public readonly locationId: string) { super() }
}

export class StoreSessionNoteRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly note: string,
  ) { super() }
}

export class LoadSessionNotesRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly limit: number = 50,
  ) { super() }
}

export class RemoveSessionNoteRequest extends RequestBase {
  constructor(public readonly noteId: string) { super() }
}

export class UpdateCampaignInventoryRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly gold: number,
    public readonly sharedItems: InventoryItem[],
  ) { super() }
}

export class LoadCampaignInventoryRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class UpdateCharacterLootRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly loot: LootItem[],
  ) { super() }
}
