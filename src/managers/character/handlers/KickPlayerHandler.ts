import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { KickCharacterRequest } from '@/accessors/character/CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'
import { KickPlayerRequest } from '../CharacterRequests'

export class KickPlayerHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as KickPlayerRequest
    const result = await this.characterAccessor.store(
      new KickCharacterRequest(req.characterId)
    )
    return new UpdateCharacterResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
