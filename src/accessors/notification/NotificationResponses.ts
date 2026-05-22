import { ResponseBase } from '@/common/ResponseBase'
import type { Whisper } from '@/types'

export class SendPushResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class StoreSubscriptionResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class StoreWhisperResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadWhispersResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly whispers: Whisper[]
  readonly errorMessage: string | null

  constructor(correlationId: string, whispers: Whisper[], errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.whispers = whispers
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}
