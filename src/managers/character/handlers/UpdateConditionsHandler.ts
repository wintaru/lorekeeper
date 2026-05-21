import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { UpdateConditionsRequest } from '../CharacterRequests'
import { UpdateCharacterResponse } from '../CharacterResponses'
import { UpdateCharacterConditionsRequest } from '@/accessors/character/CharacterRequests'

export class UpdateConditionsHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateConditionsRequest
    const result = await this.characterAccessor.store(
      new UpdateCharacterConditionsRequest(req.characterId, req.conditions)
    )
    return new UpdateCharacterResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
