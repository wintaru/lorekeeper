import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCharacterCurrencyRequest } from '../CharacterRequests'
import { UpdateCharacterCurrencyResponse } from '../CharacterResponses'

export class UpdateCharacterCurrencyHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCharacterCurrencyRequest
    const { error } = await this.db
      .from('characters')
      .update({
        gold: req.gold,
        silver: req.silver,
        copper: req.copper,
        custom_currency: req.customCurrency,
      })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateCharacterCurrencyResponse(req.correlationId, false, error.message)
    }
    return new UpdateCharacterCurrencyResponse(req.correlationId, true)
  }
}
