import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoveCustomTableRequest } from '../WorldRequests'
import { RemoveCustomTableResponse } from '../WorldResponses'

export class RemoveCustomTableHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RemoveCustomTableRequest
    const { error } = await this.db
      .from('custom_tables')
      .delete()
      .eq('id', req.tableId)

    if (error) {
      return new RemoveCustomTableResponse(req.correlationId, false, error.message)
    }

    return new RemoveCustomTableResponse(req.correlationId, true)
  }
}
