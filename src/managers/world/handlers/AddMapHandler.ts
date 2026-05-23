import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { StoreMapRequest } from '@/accessors/world/WorldRequests'
import { StoreMapResponse } from '@/accessors/world/WorldResponses'
import { AddMapRequest } from '../WorldRequests'
import { MapResponse } from '../WorldResponses'

export class AddMapHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as AddMapRequest
    const result = (await this.worldAccessor.store(
      new StoreMapRequest(req.campaignId, req.name, req.type, req.storagePath, req.imageUrl)
    )) as StoreMapResponse

    if (!result.success) {
      return new MapResponse(req.correlationId, null, result.errorMessage ?? 'Failed to store map')
    }

    return new MapResponse(req.correlationId, result.map)
  }
}
