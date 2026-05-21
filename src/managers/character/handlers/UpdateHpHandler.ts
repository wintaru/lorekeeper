import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { UpdateHpRequest } from '../CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'
import { UpdateCharacterHpRequest } from '@/accessors/character/CharacterRequests'

export class UpdateHpHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateHpRequest
    const result = await this.characterAccessor.store(
      new UpdateCharacterHpRequest(req.characterId, req.newHp)
    )
    return new UpdateCharacterResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
