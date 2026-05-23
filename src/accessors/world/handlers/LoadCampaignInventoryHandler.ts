import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadCampaignInventoryRequest } from '../WorldRequests'
import { LoadCampaignInventoryResponse } from '../WorldResponses'
import type { InventoryItem, CustomCurrencyEntry } from '@/types'

export class LoadCampaignInventoryHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadCampaignInventoryRequest
    const { data, error } = await this.db
      .from('campaigns')
      .select('id, gold, silver, copper, custom_currency, shared_items')
      .eq('id', req.campaignId)
      .single()

    if (error || !data) {
      return new LoadCampaignInventoryResponse(req.correlationId, 0, 0, 0, [], [], error?.message ?? 'Campaign not found')
    }
    return new LoadCampaignInventoryResponse(
      req.correlationId,
      (data.gold as number) ?? 0,
      (data.silver as number) ?? 0,
      (data.copper as number) ?? 0,
      (data.custom_currency as CustomCurrencyEntry[]) ?? [],
      (data.shared_items as InventoryItem[]) ?? [],
    )
  }
}
