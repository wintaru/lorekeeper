import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { UpdateMapAccessRequest as AccessorUpdateMapAccessRequest } from '@/accessors/world/WorldRequests'
import { UpdateMapAccessResponse } from '@/accessors/world/WorldResponses'
import { UpdateMapAccessRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class UpdateMapAccessHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateMapAccessRequest
    const result = (await this.worldAccessor.store(
      new AccessorUpdateMapAccessRequest(req.campaignId, req.mapAccessGranted, req.sharedMapIds, req.mapViewport)
    )) as UpdateMapAccessResponse

    return new DeleteResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
