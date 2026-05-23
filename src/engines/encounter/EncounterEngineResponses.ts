import { ResponseBase } from '@/common/ResponseBase'
import type { EncounterDifficulty } from '@/types'

export class EvaluateEncounterResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly difficulty: EncounterDifficulty | null

  constructor(correlationId: string, difficulty: EncounterDifficulty | null, errorMessage: string | null = null) {
    super()
    this.correlationId = correlationId
    this.difficulty = difficulty
    this.success = errorMessage === null
    this.errorMessage = errorMessage
  }
}
