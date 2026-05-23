import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { UpdateCharacterCurrencyRequest as AccessorRequest } from '@/accessors/character/CharacterRequests'
import { UpdateCharacterCurrencyRequest } from '../CharacterRequests'
import { UpdateCharacterCurrencyResponse } from '@/accessors/character/CharacterResponses'

export class UpdateCharacterCurrencyHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCharacterCurrencyRequest
    return this.characterAccessor.store(
      new AccessorRequest(req.characterId, req.gold, req.silver, req.copper, req.customCurrency)
    ) as Promise<UpdateCharacterCurrencyResponse>
  }
}
