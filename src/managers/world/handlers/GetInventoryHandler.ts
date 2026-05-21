import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { LoadCampaignInventoryRequest } from '@/accessors/world/WorldRequests'
import { LoadCampaignInventoryResponse } from '@/accessors/world/WorldResponses'
import { GetInventoryRequest } from '../WorldRequests'
import { GetInventoryResponse } from '../WorldResponses'

export class GetInventoryHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetInventoryRequest
    const result = (await this.worldAccessor.load(
      new LoadCampaignInventoryRequest(req.campaignId)
    )) as LoadCampaignInventoryResponse

    if (!result.success) {
      return new GetInventoryResponse(req.correlationId, 0, [], result.errorMessage ?? 'Failed to load inventory')
    }
    return new GetInventoryResponse(req.correlationId, result.gold, result.sharedItems)
  }
}
