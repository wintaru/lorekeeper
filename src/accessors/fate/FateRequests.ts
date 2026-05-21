import { RequestBase } from '@/common/RequestBase'
import type { FateEventType } from '@/types'

export class StoreFateEventRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly eventType: FateEventType,
    public readonly targetCharacterId: string,
    public readonly dmNote: string | null = null,
  ) { super() }
}

export class LoadFateLogRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly limit: number = 20,
    public readonly characterId: string | null = null,
  ) { super() }
}

export class MarkFateRevealedRequest extends RequestBase {
  constructor(public readonly fateEventId: string) { super() }
}

export class LoadPendingFateRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}
