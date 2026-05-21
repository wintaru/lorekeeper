import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateNpcRequest } from '../WorldRequests'
import { StoreNpcResponse } from '../WorldResponses'
import { rowToNpc } from './StoreNpcHandler'

export class UpdateNpcHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateNpcRequest
    const { data, error } = await this.db
      .from('npcs')
      .update({
        name: req.name,
        faction: req.faction,
        last_location: req.lastLocation,
        notes: req.notes,
        relationships: req.relationships,
      })
      .eq('id', req.npcId)
      .select()
      .single()

    if (error || !data) {
      return new StoreNpcResponse(req.correlationId, null, error?.message ?? 'Update failed')
    }
    return new StoreNpcResponse(req.correlationId, rowToNpc(data))
  }
}
