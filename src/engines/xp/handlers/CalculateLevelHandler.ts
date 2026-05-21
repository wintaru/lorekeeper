import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { CalculateLevelRequest } from '../XpEngineRequests'
import { CalculateLevelResponse } from '../XpEngineResponses'

// D&D 5e XP thresholds — index 0 = level 1, index 19 = level 20
const XP_THRESHOLDS: readonly number[] = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
]

export class CalculateLevelHandler implements IHandler {
  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as CalculateLevelRequest

    let level = 1
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (req.xp >= XP_THRESHOLDS[i]) {
        level = i + 1
        break
      }
    }

    return new CalculateLevelResponse(req.correlationId, Math.min(level, 20))
  }
}
