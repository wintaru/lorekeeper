import { RequestBase } from '@/common/RequestBase'
import type { DeathSaves, Condition, SpellSlot } from '@/types'

export class UpdateHpRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly newHp: number,
  ) { super() }
}

export class UpdateConditionsRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly conditions: Condition[],
  ) { super() }
}

export class UpdateDeathSavesRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly deathSaves: DeathSaves,
  ) { super() }
}

export class UpdateSpellSlotsRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly spellSlots: SpellSlot[],
  ) { super() }
}

export class AwardXpRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly xpToAdd: number,
  ) { super() }
}

export class WhisperRequest extends RequestBase {
  constructor(
    public readonly characterId: string,
    public readonly message: string,
  ) { super() }
}
