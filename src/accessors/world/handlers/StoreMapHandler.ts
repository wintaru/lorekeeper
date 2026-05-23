import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreMapRequest } from '../WorldRequests'
import { StoreMapResponse } from '../WorldResponses'
import type { CampaignMap } from '@/types'

export class StoreMapHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreMapRequest
    const { data, error } = await this.db
      .from('campaign_maps')
      .insert({
        campaign_id: req.campaignId,
        name: req.name,
        type: req.type,
        storage_path: req.storagePath,
        image_url: req.imageUrl,
      })
      .select()
      .single()

    if (error || !data) {
      return new StoreMapResponse(req.correlationId, null, error?.message ?? 'Insert failed')
    }

    return new StoreMapResponse(req.correlationId, rowToMap(data))
  }
}

export function rowToMap(row: Record<string, unknown>): CampaignMap {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    name: row.name as string,
    type: row.type as CampaignMap['type'],
    storagePath: row.storage_path as string,
    imageUrl: row.image_url as string,
    createdAt: new Date(row.created_at as string),
  }
}
