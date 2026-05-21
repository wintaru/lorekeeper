import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCharacterLootRequest } from '../WorldRequests'
import { UpdateCharacterLootResponse } from '../WorldResponses'

export class UpdateCharacterLootHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCharacterLootRequest
    const { error } = await this.db
      .from('characters')
      .update({ loot: req.loot })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateCharacterLootResponse(req.correlationId, false, error.message)
    }
    return new UpdateCharacterLootResponse(req.correlationId, true)
  }
}
