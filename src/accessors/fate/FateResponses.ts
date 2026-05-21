import { ResponseBase } from '@/common/ResponseBase'
import type { FateEvent } from '@/types'

export class StoreFateEventResponse extends ResponseBase {
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

export class LoadFateLogResponse extends ResponseBase {
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

export class MarkFateRevealedResponse extends ResponseBase {
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
