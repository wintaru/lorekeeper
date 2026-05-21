import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadCustomTablesRequest } from '../WorldRequests'
import { LoadCustomTablesResponse } from '../WorldResponses'
import { rowToCustomTable } from './StoreCustomTableHandler'

export class LoadCustomTablesHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadCustomTablesRequest
    const { data, error } = await this.db
      .from('custom_tables')
      .select()
      .eq('campaign_id', req.campaignId)
      .order('created_at', { ascending: true })

    if (error) {
      return new LoadCustomTablesResponse(req.correlationId, [], error.message)
    }

    return new LoadCustomTablesResponse(req.correlationId, (data ?? []).map(rowToCustomTable))
  }
}
