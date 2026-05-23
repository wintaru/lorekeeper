import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { ResolveInitiativeRequest } from '../CombatRequests'
import { ResolveInitiativeResponse } from '../CombatResponses'
import { ResolveInitiativeRequestRequest } from '@/accessors/combat/CombatRequests'
import type { ResolveInitiativeRequestResponse } from '@/accessors/combat/CombatResponses'

export class ResolveInitiativeHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as ResolveInitiativeRequest
    const result = (await this.combatAccessor.store(
      new ResolveInitiativeRequestRequest(req.campaignId)
    )) as ResolveInitiativeRequestResponse

    if (!result.success) {
      return new ResolveInitiativeResponse(req.correlationId, result.errorMessage ?? 'Failed to resolve initiative request')
    }
    return new ResolveInitiativeResponse(req.correlationId)
  }
}
