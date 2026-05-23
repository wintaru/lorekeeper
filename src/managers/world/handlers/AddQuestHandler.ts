import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { AddQuestRequest } from '../WorldRequests'
import { QuestResponse } from '../WorldResponses'
import { StoreQuestRequest } from '@/accessors/world/WorldRequests'
import type { StoreQuestResponse } from '@/accessors/world/WorldResponses'

export class AddQuestHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as AddQuestRequest
    const result = (await this.worldAccessor.store(new StoreQuestRequest(
      req.campaignId, req.title, req.description, req.giver, req.objective,
      req.location, req.complications, req.reward, req.difficulty,
      req.questType, req.isOptional,
    ))) as StoreQuestResponse
    return new QuestResponse(req.correlationId, result.quest, result.errorMessage ?? undefined)
  }
}
