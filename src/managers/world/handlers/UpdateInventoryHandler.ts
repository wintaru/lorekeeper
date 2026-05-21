import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { UpdateCampaignInventoryRequest } from '@/accessors/world/WorldRequests'
import { UpdateCampaignInventoryResponse } from '@/accessors/world/WorldResponses'
import { UpdateInventoryRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class UpdateInventoryHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateInventoryRequest
    const result = (await this.worldAccessor.store(
      new UpdateCampaignInventoryRequest(req.campaignId, req.gold, req.sharedItems)
    )) as UpdateCampaignInventoryResponse

    if (!result.success) {
      return new DeleteResponse(req.correlationId, false, result.errorMessage ?? 'Failed to update inventory')
    }
    return new DeleteResponse(req.correlationId, true)
  }
}
