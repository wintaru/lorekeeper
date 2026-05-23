import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { GetQuestsRequest } from '../WorldRequests'
import { GetQuestsResponse } from '../WorldResponses'
import { LoadQuestsRequest } from '@/accessors/world/WorldRequests'
import type { LoadQuestsResponse } from '@/accessors/world/WorldResponses'

export class GetQuestsHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetQuestsRequest
    const result = (await this.worldAccessor.load(new LoadQuestsRequest(req.campaignId, req.publicOnly))) as LoadQuestsResponse
    return new GetQuestsResponse(req.correlationId, result.quests, result.errorMessage ?? undefined)
  }
}
