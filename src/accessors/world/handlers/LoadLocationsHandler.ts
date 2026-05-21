import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadLocationsRequest } from '../WorldRequests'
import { LoadLocationsResponse } from '../WorldResponses'
import { rowToLocation } from './StoreLocationHandler'

export class LoadLocationsHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadLocationsRequest
    const { data, error } = await this.db
      .from('locations')
      .select()
      .eq('campaign_id', req.campaignId)
      .order('created_at', { ascending: true })

    if (error) {
      return new LoadLocationsResponse(req.correlationId, [], error.message)
    }
    return new LoadLocationsResponse(req.correlationId, (data ?? []).map(rowToLocation))
  }
}
