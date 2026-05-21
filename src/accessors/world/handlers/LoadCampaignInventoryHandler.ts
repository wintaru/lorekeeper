import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadCampaignInventoryRequest } from '../WorldRequests'
import { LoadCampaignInventoryResponse } from '../WorldResponses'
import type { InventoryItem } from '@/types'

export class LoadCampaignInventoryHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadCampaignInventoryRequest
    const { data, error } = await this.db
      .from('campaigns')
      .select('id, gold, shared_items')
      .eq('id', req.campaignId)
      .single()

    if (error || !data) {
      return new LoadCampaignInventoryResponse(req.correlationId, 0, [], error?.message ?? 'Campaign not found')
    }
    return new LoadCampaignInventoryResponse(
      req.correlationId,
      data.gold as number,
      (data.shared_items as InventoryItem[]) ?? [],
    )
  }
}
