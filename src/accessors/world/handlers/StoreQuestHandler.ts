import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreQuestRequest } from '../WorldRequests'
import { StoreQuestResponse } from '../WorldResponses'
import type { Quest, QuestStatus } from '@/types'

export class StoreQuestHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreQuestRequest
    const { data, error } = await this.db
      .from('quests')
      .insert({
        campaign_id: req.campaignId,
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
      })
      .select()
      .single()

    if (error || !data) {
      return new StoreQuestResponse(req.correlationId, null, error?.message ?? 'Insert failed')
    }
    return new StoreQuestResponse(req.correlationId, rowToQuest(data))
  }
}

export function rowToQuest(row: Record<string, unknown>): Quest {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    giver: (row.giver as string) ?? null,
    objective: (row.objective as string) ?? null,
    location: (row.location as string) ?? null,
    complications: (row.complications as string) ?? null,
    reward: (row.reward as string) ?? null,
    difficulty: row.difficulty as number,
    questType: (row.quest_type as string) ?? null,
    isOptional: row.is_optional as boolean,
    isPublic: row.is_public as boolean,
    status: row.status as QuestStatus,
    createdAt: new Date(row.created_at as string),
  }
}
