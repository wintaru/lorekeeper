import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { UpdateSpellSlotsRequest } from '../CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'
import { UpdateSpellSlotsRequest as AccessorUpdateSpellSlotsRequest } from '@/accessors/character/CharacterRequests'

export class UpdateSpellSlotsHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateSpellSlotsRequest
    const result = await this.characterAccessor.store(
      new AccessorUpdateSpellSlotsRequest(req.characterId, req.spellSlots)
    )
    return new UpdateCharacterResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
