import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoveLocationRequest } from '../WorldRequests'
import { RemoveLocationResponse } from '../WorldResponses'

export class RemoveLocationHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RemoveLocationRequest
    const { error } = await this.db
      .from('locations')
      .delete()
      .eq('id', req.locationId)

    if (error) {
      return new RemoveLocationResponse(req.correlationId, false, error.message)
    }
    return new RemoveLocationResponse(req.correlationId, true)
  }
}
