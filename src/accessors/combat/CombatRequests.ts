import { RequestBase } from '@/common/RequestBase'
import type { InitiativeEntry, CombatSession } from '@/types'

export class StoreCombatSessionRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly initiativeOrder: InitiativeEntry[],
  ) { super() }
}

export class LoadCombatSessionRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class UpdateCombatSessionRequest extends RequestBase {
  constructor(
    public readonly sessionId: string,
    public readonly updates: Partial<Pick<CombatSession, 'initiativeOrder' | 'currentTurnIndex' | 'roundNumber' | 'isActive'>>,
  ) { super() }
}
