import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { RemoveMapRequest } from '@/accessors/world/WorldRequests'
import { RemoveMapResponse } from '@/accessors/world/WorldResponses'
import { DeleteMapRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class DeleteMapHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DeleteMapRequest
    const result = (await this.worldAccessor.remove(
      new RemoveMapRequest(req.mapId, req.storagePath)
    )) as RemoveMapResponse

    return new DeleteResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
