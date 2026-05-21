import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { StartCombatRequest } from '../CombatRequests'
import { StartCombatResponse } from '../CombatResponses'
import {
  LoadCombatSessionRequest,
  StoreCombatSessionRequest,
  UpdateCombatSessionRequest,
} from '@/accessors/combat/CombatRequests'
import type { LoadCombatSessionResponse } from '@/accessors/combat/CombatResponses'
import type { StoreCombatSessionResponse } from '@/accessors/combat/CombatResponses'

export class StartCombatHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StartCombatRequest

    // End any existing active session for this campaign
    const loadResult = (await this.combatAccessor.load(
      new LoadCombatSessionRequest(req.campaignId)
    )) as LoadCombatSessionResponse

    if (loadResult.session) {
      await this.combatAccessor.store(
        new UpdateCombatSessionRequest(loadResult.session.id, { isActive: false })
      )
    }

    // Start new session
    const storeResult = (await this.combatAccessor.store(
      new StoreCombatSessionRequest(req.campaignId, req.initiativeOrder)
    )) as StoreCombatSessionResponse

    if (!storeResult.success) {
      return new StartCombatResponse(req.correlationId, null, storeResult.errorMessage ?? 'Failed to start combat')
    }

    return new StartCombatResponse(req.correlationId, storeResult.session)
  }
}
