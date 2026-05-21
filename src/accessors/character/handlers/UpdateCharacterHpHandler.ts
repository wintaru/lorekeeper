import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCharacterHpRequest } from '../CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'

export class UpdateCharacterHpHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCharacterHpRequest
    const { error } = await this.db
      .from('characters')
      .update({ current_hp: req.currentHp })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateCharacterResponse(req.correlationId, false, error.message)
    }
    return new UpdateCharacterResponse(req.correlationId, true)
  }
}
