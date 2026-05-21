import { ResponseBase } from '@/common/ResponseBase'

export class SelectTargetResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly targetCharacterId: string | null

  constructor(correlationId: string, targetCharacterId: string | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.targetCharacterId = targetCharacterId
    this.success = targetCharacterId !== null
    this.errorMessage = errorMessage ?? null
  }
}
