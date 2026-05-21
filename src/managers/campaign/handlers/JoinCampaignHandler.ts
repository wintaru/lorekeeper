import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICampaignAccessor } from '@/accessors/campaign/ICampaignAccessor'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import { LoadCampaignByCodeRequest } from '@/accessors/campaign/CampaignRequests'
import { LoadCampaignByCodeResponse } from '@/accessors/campaign/CampaignResponses'
import { StoreCharacterRequest } from '@/accessors/character/CharacterRequests'
import { StoreCharacterResponse } from '@/accessors/character/CharacterResponses'
import { JoinCampaignRequest } from '../CampaignRequests'
import { JoinCampaignResponse } from '../CampaignResponses'

export class JoinCampaignHandler implements IHandler {
  constructor(
    private readonly campaignAccessor: ICampaignAccessor,
    private readonly characterAccessor: ICharacterAccessor,
  ) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as JoinCampaignRequest

    const campaignResult = (await this.campaignAccessor.load(
      new LoadCampaignByCodeRequest(req.campaignCode)
    )) as LoadCampaignByCodeResponse

    if (!campaignResult.success || !campaignResult.campaign) {
      return new JoinCampaignResponse(req.correlationId, null, null, 'Campaign not found')
    }

    const characterResult = (await this.characterAccessor.store(
      new StoreCharacterRequest(
        campaignResult.campaign.id,
        req.playerName,
        req.characterName,
        req.characterClass,
        req.level,
        req.maxHp,
        req.armorClass,
        req.spellSlots,
      )
    )) as StoreCharacterResponse

    if (!characterResult.success || !characterResult.character) {
      return new JoinCampaignResponse(req.correlationId, null, null, characterResult.errorMessage ?? 'Failed to create character')
    }

    return new JoinCampaignResponse(req.correlationId, characterResult.character, campaignResult.campaign)
  }
}
