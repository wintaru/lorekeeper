import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { GetInitiativeRequestRequest } from '../CombatRequests'
import { GetInitiativeRequestResponse } from '../CombatResponses'
import { LoadInitiativeRequestRequest } from '@/accessors/combat/CombatRequests'
import type { LoadInitiativeRequestResponse } from '@/accessors/combat/CombatResponses'

export class GetInitiativeRequestHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetInitiativeRequestRequest
    const result = (await this.combatAccessor.load(
      new LoadInitiativeRequestRequest(req.campaignId)
    )) as LoadInitiativeRequestResponse

    return new GetInitiativeRequestResponse(req.correlationId, result.request)
  }
}
