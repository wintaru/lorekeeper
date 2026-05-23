import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { KickCharacterRequest } from '../CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'

export class KickCharacterHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as KickCharacterRequest
    const { error } = await this.db
      .from('characters')
      .update({ is_active: false })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateCharacterResponse(req.correlationId, false, error.message)
    }
    return new UpdateCharacterResponse(req.correlationId, true)
  }
}
