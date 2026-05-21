import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { RemoveLocationRequest } from '@/accessors/world/WorldRequests'
import { RemoveLocationResponse } from '@/accessors/world/WorldResponses'
import { DeleteLocationRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class DeleteLocationHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DeleteLocationRequest
    const result = (await this.worldAccessor.remove(
      new RemoveLocationRequest(req.locationId)
    )) as RemoveLocationResponse

    if (!result.success) {
      return new DeleteResponse(req.correlationId, false, result.errorMessage ?? 'Failed to delete location')
    }
    return new DeleteResponse(req.correlationId, true)
  }
}
