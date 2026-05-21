import { RequestBase } from '@/common/RequestBase'
import type { FateEventType } from '@/types'

export class DrawFateRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly eventType: FateEventType,
    public readonly excludedCharacterIds: string[] = [],
    public readonly dangerWeighted: boolean = false,
  ) { super() }
}

export class RevealFateRequest extends RequestBase {
  constructor(public readonly fateEventId: string) { super() }
}

export class GetFateLogRequest extends RequestBase {
  constructor(
    public readonly campaignId: string,
    public readonly limit: number = 20,
    public readonly characterId: string | null = null,
  ) { super() }
}

export class GetPendingFateRequest extends RequestBase {
  constructor(public readonly campaignId: string) { super() }
}
