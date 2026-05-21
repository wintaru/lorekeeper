import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCharacterConditionsRequest } from '../CharacterRequests'
import { UpdateConditionsResponse } from '../CharacterResponses'

export class UpdateConditionsHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCharacterConditionsRequest
    const { error } = await this.db
      .from('characters')
      .update({ conditions: req.conditions })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateConditionsResponse(req.correlationId, false, error.message)
    }
    return new UpdateConditionsResponse(req.correlationId, true)
  }
}
