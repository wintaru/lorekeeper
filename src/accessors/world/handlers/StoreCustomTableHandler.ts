import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreCustomTableRequest } from '../WorldRequests'
import { StoreCustomTableResponse } from '../WorldResponses'
import type { CustomTable } from '@/types'

export class StoreCustomTableHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreCustomTableRequest
    const { data, error } = await this.db
      .from('custom_tables')
      .insert({
        campaign_id: req.campaignId,
        name: req.name,
        entries: req.entries,
      })
      .select()
      .single()

    if (error || !data) {
      return new StoreCustomTableResponse(req.correlationId, null, error?.message ?? 'Insert failed')
    }

    return new StoreCustomTableResponse(req.correlationId, rowToCustomTable(data))
  }
}

export function rowToCustomTable(row: Record<string, unknown>): CustomTable {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    name: row.name as string,
    entries: (row.entries as string[]) ?? [],
    createdAt: new Date(row.created_at as string),
  }
}
