import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { SubmitInitiativeRollRequest } from '../CombatRequests'
import { SubmitInitiativeRollResponse } from '../CombatResponses'
import { UpdateInitiativeRollsRequest } from '@/accessors/combat/CombatRequests'
import type { UpdateInitiativeRollsResponse } from '@/accessors/combat/CombatResponses'

export class SubmitInitiativeRollHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as SubmitInitiativeRollRequest
    const result = (await this.combatAccessor.store(
      new UpdateInitiativeRollsRequest(req.campaignId, req.characterId, req.roll)
    )) as UpdateInitiativeRollsResponse

    if (!result.success) {
      return new SubmitInitiativeRollResponse(req.correlationId, result.errorMessage ?? 'Failed to submit roll')
    }
    return new SubmitInitiativeRollResponse(req.correlationId)
  }
}
