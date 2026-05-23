import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateQuestRequest } from '../WorldRequests'
import { StoreQuestResponse } from '../WorldResponses'
import { rowToQuest } from './StoreQuestHandler'

export class UpdateQuestHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateQuestRequest
    const { data, error } = await this.db
      .from('quests')
      .update({
        title: req.title,
        description: req.description,
        giver: req.giver,
        objective: req.objective,
        location: req.location,
        complications: req.complications,
        reward: req.reward,
        difficulty: req.difficulty,
        quest_type: req.questType,
        is_optional: req.isOptional,
        is_public: req.isPublic,
        status: req.status,
      })
      .eq('id', req.questId)
      .select()
      .single()

    if (error || !data) {
      return new StoreQuestResponse(req.correlationId, null, error?.message ?? 'Update failed')
    }
    return new StoreQuestResponse(req.correlationId, rowToQuest(data))
  }
}
