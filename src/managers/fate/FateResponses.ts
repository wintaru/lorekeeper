import { ResponseBase } from '@/common/ResponseBase'
import type { FateEvent } from '@/types'

export class DrawFateResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly fateEvent: FateEvent | null
  readonly pushSent: boolean

  constructor(correlationId: string, fateEvent: FateEvent | null, pushSent: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.fateEvent = fateEvent
    this.success = fateEvent !== null
    this.pushSent = pushSent
    this.errorMessage = errorMessage ?? null
  }
}

export class RevealFateResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly fateEvent: FateEvent | null

  constructor(correlationId: string, fateEvent: FateEvent | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.fateEvent = fateEvent
    this.success = fateEvent !== null
    this.errorMessage = errorMessage ?? null
  }
}

export class GetFateLogResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly events: FateEvent[]

  constructor(correlationId: string, events: FateEvent[], errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.events = events
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}
