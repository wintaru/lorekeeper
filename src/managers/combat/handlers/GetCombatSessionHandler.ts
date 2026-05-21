import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { GetCombatSessionRequest } from '../CombatRequests'
import { GetCombatSessionResponse } from '../CombatResponses'
import { LoadCombatSessionRequest } from '@/accessors/combat/CombatRequests'
import type { LoadCombatSessionResponse } from '@/accessors/combat/CombatResponses'

export class GetCombatSessionHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetCombatSessionRequest
    const result = (await this.combatAccessor.load(
      new LoadCombatSessionRequest(req.campaignId)
    )) as LoadCombatSessionResponse

    return new GetCombatSessionResponse(req.correlationId, result.session)
  }
}
