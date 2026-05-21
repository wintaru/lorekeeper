import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { LoadLocationsRequest } from '@/accessors/world/WorldRequests'
import { LoadLocationsResponse } from '@/accessors/world/WorldResponses'
import { GetLocationsRequest } from '../WorldRequests'
import { GetLocationsResponse } from '../WorldResponses'

export class GetLocationsHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetLocationsRequest
    const result = (await this.worldAccessor.load(
      new LoadLocationsRequest(req.campaignId)
    )) as LoadLocationsResponse

    if (!result.success) {
      return new GetLocationsResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load locations')
    }
    return new GetLocationsResponse(req.correlationId, result.locations)
  }
}
