import { ResponseBase } from '@/common/ResponseBase'

export class CalculateLevelResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly level: number

  constructor(correlationId: string, level: number) {
    super()
    this.correlationId = correlationId
    this.level = level
    this.success = true
    this.errorMessage = null
  }
}
