import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateDeathSavesRequest } from '../CharacterRequests'
import { UpdateDeathSavesResponse } from '../CharacterResponses'

export class UpdateDeathSavesHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateDeathSavesRequest
    const { error } = await this.db
      .from('characters')
      .update({ death_saves: req.deathSaves })
      .eq('id', req.characterId)

    if (error) {
      return new UpdateDeathSavesResponse(req.correlationId, false, error.message)
    }
    return new UpdateDeathSavesResponse(req.correlationId, true)
  }
}
