import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { RequestInitiativeRequest } from '../CombatRequests'
import { RequestInitiativeResponse } from '../CombatResponses'
import { StoreInitiativeRequestRequest } from '@/accessors/combat/CombatRequests'
import type { StoreInitiativeRequestResponse } from '@/accessors/combat/CombatResponses'

export class RequestInitiativeHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RequestInitiativeRequest
    const result = (await this.combatAccessor.store(
      new StoreInitiativeRequestRequest(req.campaignId)
    )) as StoreInitiativeRequestResponse

    if (!result.success) {
      return new RequestInitiativeResponse(req.correlationId, null, result.errorMessage ?? 'Failed to request initiative')
    }
    return new RequestInitiativeResponse(req.correlationId, result.request)
  }
}
