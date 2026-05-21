import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { UpdateLocationRequest as AccessorUpdateLocationRequest } from '@/accessors/world/WorldRequests'
import { StoreLocationResponse } from '@/accessors/world/WorldResponses'
import { UpdateLocationRequest } from '../WorldRequests'
import { LocationResponse } from '../WorldResponses'

export class UpdateLocationHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateLocationRequest
    const result = (await this.worldAccessor.store(
      new AccessorUpdateLocationRequest(req.locationId, req.visited, req.notes)
    )) as StoreLocationResponse

    if (!result.success || !result.location) {
      return new LocationResponse(req.correlationId, null, result.errorMessage ?? 'Failed to update location')
    }
    return new LocationResponse(req.correlationId, result.location)
  }
}
