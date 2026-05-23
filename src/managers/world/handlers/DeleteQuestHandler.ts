import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { DeleteQuestRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'
import { RemoveQuestRequest } from '@/accessors/world/WorldRequests'
import type { RemoveQuestResponse } from '@/accessors/world/WorldResponses'

export class DeleteQuestHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DeleteQuestRequest
    const result = (await this.worldAccessor.remove(new RemoveQuestRequest(req.questId))) as RemoveQuestResponse
    return new DeleteResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
