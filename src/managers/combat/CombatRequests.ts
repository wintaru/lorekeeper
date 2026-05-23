import { RequestBase } from '@/common/RequestBase'
import type { InitiativeEntry } from '@/types'

export class StartCombatRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly initiativeOrder: InitiativeEntry[],
  ) { super() }
}

export class EndCombatRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class NextTurnRequest extends RequestBase {
  constructor(
    public readonly sessionId: string,
    public readonly currentTurnIndex: number,
    public readonly initiativeOrderLength: number,
    public readonly roundNumber: number,
  ) { super() }
}

export class GetCombatSessionRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class RequestInitiativeRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class GetInitiativeRequestRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}

export class SubmitInitiativeRollRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly characterId: string,
    public readonly roll: number,
  ) { super() }
}

export class ResolveInitiativeRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}
