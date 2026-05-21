import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadNpcsRequest } from '../WorldRequests'
import { LoadNpcsResponse } from '../WorldResponses'
import { rowToNpc } from './StoreNpcHandler'

export class LoadNpcsHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadNpcsRequest
    const { data, error } = await this.db
      .from('npcs')
      .select()
      .eq('campaign_id', req.campaignId)
      .order('created_at', { ascending: true })

    if (error) {
      return new LoadNpcsResponse(req.correlationId, [], error.message)
    }
    return new LoadNpcsResponse(req.correlationId, (data ?? []).map(rowToNpc))
  }
}
