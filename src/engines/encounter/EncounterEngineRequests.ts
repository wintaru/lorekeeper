import { RequestBase } from '@/common/RequestBase'
import type { MonsterGroup, Character } from '@/types'

export class EvaluateEncounterRequest extends RequestBase {
  constructor(
    public readonly monsterGroups: MonsterGroup[],
    public readonly party: Character[],
  ) { super() }
}
