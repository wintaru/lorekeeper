import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { EndCombatRequest } from '../CombatRequests'
import { EndCombatResponse } from '../CombatResponses'
import {
  LoadCombatSessionRequest,
  UpdateCombatSessionRequest,
} from '@/accessors/combat/CombatRequests'
import type { LoadCombatSessionResponse } from '@/accessors/combat/CombatResponses'

export class EndCombatHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as EndCombatRequest

    const loadResult = (await this.combatAccessor.load(
      new LoadCombatSessionRequest(req.campaignId)
    )) as LoadCombatSessionResponse

    if (!loadResult.success) {
      return new EndCombatResponse(req.correlationId, false, loadResult.errorMessage ?? 'Failed to load combat session')
    }

    // No active session — idempotent success
    if (!loadResult.session) {
      return new EndCombatResponse(req.correlationId, true)
    }

    const updateResult = await this.combatAccessor.store(
      new UpdateCombatSessionRequest(loadResult.session.id, { isActive: false })
    )

    if (!updateResult.success) {
      return new EndCombatResponse(req.correlationId, false, updateResult.errorMessage ?? 'Failed to end combat session')
    }

    return new EndCombatResponse(req.correlationId, true)
  }
}
