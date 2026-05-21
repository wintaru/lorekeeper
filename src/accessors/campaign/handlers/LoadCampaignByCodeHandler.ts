import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadCampaignByCodeRequest } from '../CampaignRequests'
import { LoadCampaignByCodeResponse } from '../CampaignResponses'
import type { Campaign, InventoryItem } from '@/types'

export class LoadCampaignByCodeHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadCampaignByCodeRequest
    const { data, error } = await this.db
      .from('campaigns')
      .select()
      .eq('code', req.code.toUpperCase())
      .single()

    if (error || !data) {
      return new LoadCampaignByCodeResponse(req.correlationId, null, 'Campaign not found')
    }

    const campaign: Campaign = {
      id: data.id,
      code: data.code,
      gold: (data.gold as number) ?? 0,
      sharedItems: (data.shared_items as InventoryItem[]) ?? [],
      createdAt: new Date(data.created_at),
      lastActiveAt: new Date(data.last_active_at),
      expiresAt: new Date(data.expires_at),
    }
    return new LoadCampaignByCodeResponse(req.correlationId, campaign)
  }
}
