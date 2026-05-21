import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IFateAccessor } from '@/accessors/fate/IFateAccessor'
import { MarkFateRevealedRequest } from '@/accessors/fate/FateRequests'
import { MarkFateRevealedResponse } from '@/accessors/fate/FateResponses'
import { RevealFateRequest } from '../FateRequests'
import { RevealFateResponse } from '../FateResponses'

export class RevealFateHandler implements IHandler {
  constructor(private readonly fateAccessor: IFateAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RevealFateRequest

    const markResult = (await this.fateAccessor.store(
      new MarkFateRevealedRequest(req.fateEventId)
    )) as MarkFateRevealedResponse

    if (!markResult.success) {
      return new RevealFateResponse(req.correlationId, null, markResult.errorMessage ?? 'Reveal failed')
    }

    return new RevealFateResponse(req.correlationId, markResult.fateEvent)
  }
}
