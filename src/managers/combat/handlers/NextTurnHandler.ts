import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICombatAccessor } from '@/accessors/combat/ICombatAccessor'
import { NextTurnRequest } from '../CombatRequests'
import { NextTurnResponse } from '../CombatResponses'
import { UpdateCombatSessionRequest } from '@/accessors/combat/CombatRequests'
import type { UpdateCombatSessionResponse } from '@/accessors/combat/CombatResponses'

export class NextTurnHandler implements IHandler {
  constructor(private readonly combatAccessor: ICombatAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as NextTurnRequest

    const nextIndex = (req.currentTurnIndex + 1) % req.initiativeOrderLength
    const nextRound = nextIndex === 0 ? req.roundNumber + 1 : req.roundNumber

    const updateResult = (await this.combatAccessor.store(
      new UpdateCombatSessionRequest(req.sessionId, {
        currentTurnIndex: nextIndex,
        roundNumber: nextRound,
      })
    )) as UpdateCombatSessionResponse

    if (!updateResult.success) {
      return new NextTurnResponse(req.correlationId, null, updateResult.errorMessage ?? 'Failed to advance turn')
    }

    return new NextTurnResponse(req.correlationId, updateResult.session)
  }
}
