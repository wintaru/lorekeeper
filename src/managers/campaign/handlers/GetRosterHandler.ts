import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { LoadRosterRequest } from '@/accessors/character/CharacterRequests'
import { LoadRosterResponse } from '@/accessors/character/CharacterResponses'
import { GetRosterRequest } from '../CampaignRequests'
import { GetRosterResponse } from '../CampaignResponses'

export class GetRosterHandler implements IHandler {
  constructor(private readonly characterAccessor: ICharacterAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetRosterRequest
    const result = (await this.characterAccessor.load(
      new LoadRosterRequest(req.campaignId)
    )) as LoadRosterResponse

    if (!result.success) {
      return new GetRosterResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load roster')
    }
    return new GetRosterResponse(req.correlationId, result.characters)
  }
}
