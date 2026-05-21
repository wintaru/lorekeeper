import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateSpellSlotsRequest } from '../CharacterRequests'
import { UpdateSpellSlotsResponse } from '../CharacterResponses'

export class UpdateSpellSlotsHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateSpellSlotsRequest
    const { error } = await this.db
      .from('characters')
      .update({ spell_slots: req.spellSlots })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateSpellSlotsResponse(req.correlationId, false, error.message)
    }
    return new UpdateSpellSlotsResponse(req.correlationId, true)
  }
}
