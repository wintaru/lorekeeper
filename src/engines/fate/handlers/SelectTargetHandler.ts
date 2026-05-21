import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { SelectTargetRequest } from '../FateEngineRequests'
import { SelectTargetResponse } from '../FateEngineResponses'

export class SelectTargetHandler implements IHandler {
  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as SelectTargetRequest

    if (req.pool.length === 0) {
      return new SelectTargetResponse(req.correlationId, null, 'Fate pool is empty')
    }

    const totalWeight = req.pool.reduce((sum, entry) => sum + entry.weight, 0)
    let roll = Math.random() * totalWeight

    for (const entry of req.pool) {
      roll -= entry.weight
      if (roll <= 0) {
        return new SelectTargetResponse(req.correlationId, entry.characterId)
      }
    }

    // Fallback — floating point edge case, return last entry
    return new SelectTargetResponse(req.correlationId, req.pool[req.pool.length - 1].characterId)
  }
}
