import { RequestBase } from '@/common/RequestBase'
import type { NpcRelationship, InventoryItem, LootItem } from '@/types'

export class AddNpcRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly name: string,
    public readonly faction: string | null = null,
    public readonly lastLocation: string | null = null,
    public readonly notes: string | null = null,
    public readonly relationships: NpcRelationship[] = [],
  ) { super() }
}

export class EditNpcRequest extends RequestBase {
  constructor(
    public readonly npcId: string,
    public readonly name: string,
    public readonly faction: string | null = null,
    public readonly lastLocation: string | null = null,
    public readonly notes: string | null = null,
    public readonly relationships: NpcRelationship[] = [],
  ) { super() }
}

export class DeleteNpcRequest extends RequestBase {
  constructor(public readonly npcId: string) { super() }
}

export class GetNpcsRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class AddLocationRequest extends RequestBase {
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

export class DeleteLocationRequest extends RequestBase {
  constructor(public readonly locationId: string) { super() }
}

export class GetLocationsRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class AddSessionNoteRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly note: string,
  ) { super() }
}

export class DeleteSessionNoteRequest extends RequestBase {
  constructor(public readonly noteId: string) { super() }
}

export class GetSessionNotesRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly limit: number = 50,
  ) { super() }
}

export class UpdateInventoryRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly gold: number,
    public readonly sharedItems: InventoryItem[],
  ) { super() }
}

export class GetInventoryRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class UpdateCharacterLootRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly loot: LootItem[],
  ) { super() }
}
