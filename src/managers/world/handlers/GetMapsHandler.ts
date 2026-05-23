import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { LoadMapsRequest } from '@/accessors/world/WorldRequests'
import { LoadMapsResponse } from '@/accessors/world/WorldResponses'
import { GetMapsRequest } from '../WorldRequests'
import { GetMapsResponse } from '../WorldResponses'

export class GetMapsHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetMapsRequest
    const result = (await this.worldAccessor.load(
      new LoadMapsRequest(req.campaignId)
    )) as LoadMapsResponse

    if (!result.success) {
      return new GetMapsResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load maps')
    }

    return new GetMapsResponse(req.correlationId, result.maps)
  }
}
