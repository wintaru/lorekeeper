import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoveQuestRequest } from '../WorldRequests'
import { RemoveQuestResponse } from '../WorldResponses'

export class RemoveQuestHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RemoveQuestRequest
    const { error } = await this.db
      .from('quests')
      .delete()
      .eq('id', req.questId)

    if (error) {
      return new RemoveQuestResponse(req.correlationId, false, error.message)
    }
    return new RemoveQuestResponse(req.correlationId, true)
  }
}
