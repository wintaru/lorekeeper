import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCampaignInventoryRequest } from '../WorldRequests'
import { UpdateCampaignInventoryResponse } from '../WorldResponses'

export class UpdateCampaignInventoryHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCampaignInventoryRequest
    const { error } = await this.db
      .from('campaigns')
      .update({
        gold: req.gold,
        shared_items: req.sharedItems,
      })
      .eq('id', req.campaignId)

    if (error) {
      return new UpdateCampaignInventoryResponse(req.correlationId, false, error.message)
    }
    return new UpdateCampaignInventoryResponse(req.correlationId, true)
  }
}
