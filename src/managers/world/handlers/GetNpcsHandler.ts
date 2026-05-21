import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { LoadNpcsRequest } from '@/accessors/world/WorldRequests'
import { LoadNpcsResponse } from '@/accessors/world/WorldResponses'
import { GetNpcsRequest } from '../WorldRequests'
import { GetNpcsResponse } from '../WorldResponses'

export class GetNpcsHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetNpcsRequest
    const result = (await this.worldAccessor.load(
      new LoadNpcsRequest(req.campaignId)
    )) as LoadNpcsResponse

    if (!result.success) {
      return new GetNpcsResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load NPCs')
    }
    return new GetNpcsResponse(req.correlationId, result.npcs)
  }
}
