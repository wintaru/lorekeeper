import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadQuestsRequest } from '../WorldRequests'
import { LoadQuestsResponse } from '../WorldResponses'
import { rowToQuest } from './StoreQuestHandler'

export class LoadQuestsHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadQuestsRequest
    let query = this.db
      .from('quests')
      .select()
      .eq('campaign_id', req.campaignId)
      .order('created_at', { ascending: true })

    if (req.publicOnly) {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query

    if (error) {
      return new LoadQuestsResponse(req.correlationId, [], error.message)
    }
    return new LoadQuestsResponse(req.correlationId, (data ?? []).map(rowToQuest))
  }
}
