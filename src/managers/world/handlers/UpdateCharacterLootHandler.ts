import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { UpdateCharacterLootRequest as AccessorUpdateCharacterLootRequest } from '@/accessors/world/WorldRequests'
import { UpdateCharacterLootResponse } from '@/accessors/world/WorldResponses'
import { UpdateCharacterLootRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class UpdateCharacterLootHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCharacterLootRequest
    const result = (await this.worldAccessor.store(
      new AccessorUpdateCharacterLootRequest(req.characterId, req.loot)
    )) as UpdateCharacterLootResponse

    if (!result.success) {
      return new DeleteResponse(req.correlationId, false, result.errorMessage ?? 'Failed to update character loot')
    }
    return new DeleteResponse(req.correlationId, true)
  }
}
