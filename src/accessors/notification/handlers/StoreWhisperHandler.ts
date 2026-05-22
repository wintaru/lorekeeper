import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreWhisperRequest } from '../NotificationRequests'
import { StoreWhisperResponse } from '../NotificationResponses'

export class StoreWhisperHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreWhisperRequest
    const { error } = await this.db
      .from('whispers')
      .insert({ character_id: req.characterId, message: req.message })

    if (error) {
      return new StoreWhisperResponse(req.correlationId, false, error.message)
    }
    return new StoreWhisperResponse(req.correlationId, true)
  }
}
