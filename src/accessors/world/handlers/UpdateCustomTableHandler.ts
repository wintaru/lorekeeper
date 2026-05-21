import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCustomTableRequest } from '../WorldRequests'
import { StoreCustomTableResponse } from '../WorldResponses'
import { rowToCustomTable } from './StoreCustomTableHandler'

export class UpdateCustomTableHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCustomTableRequest
    const { data, error } = await this.db
      .from('custom_tables')
      .update({ name: req.name, entries: req.entries })
      .eq('id', req.tableId)
      .select()
      .single()

    if (error || !data) {
      return new StoreCustomTableResponse(req.correlationId, null, error?.message ?? 'Update failed')
    }

    return new StoreCustomTableResponse(req.correlationId, rowToCustomTable(data))
  }
}
