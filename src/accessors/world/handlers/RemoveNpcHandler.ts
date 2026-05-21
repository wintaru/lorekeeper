import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoveNpcRequest } from '../WorldRequests'
import { RemoveNpcResponse } from '../WorldResponses'

export class RemoveNpcHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RemoveNpcRequest
    const { error } = await this.db
      .from('npcs')
      .delete()
      .eq('id', req.npcId)

    if (error) {
      return new RemoveNpcResponse(req.correlationId, false, error.message)
    }
    return new RemoveNpcResponse(req.correlationId, true)
  }
}
