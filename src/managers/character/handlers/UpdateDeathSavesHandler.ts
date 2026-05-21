import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { UpdateDeathSavesRequest } from '../CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'
import { UpdateDeathSavesRequest as AccessorUpdateDeathSavesRequest } from '@/accessors/character/CharacterRequests'

export class UpdateDeathSavesHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateDeathSavesRequest
    const result = await this.characterAccessor.store(
      new AccessorUpdateDeathSavesRequest(req.characterId, req.deathSaves)
    )
    return new UpdateCharacterResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
