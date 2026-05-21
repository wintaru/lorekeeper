import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICampaignAccessor } from '@/accessors/campaign/ICampaignAccessor'
import { LoadCampaignByCodeRequest } from '@/accessors/campaign/CampaignRequests'
import { LoadCampaignByCodeResponse } from '@/accessors/campaign/CampaignResponses'
import { ValidateDmPinRequest } from '../CampaignRequests'
import { ValidateDmPinResponse } from '../CampaignResponses'

export class ValidateDmPinHandler implements IHandler {
  constructor(private readonly campaignAccessor: ICampaignAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as ValidateDmPinRequest

    const result = (await this.campaignAccessor.load(
      new LoadCampaignByCodeRequest(req.campaignCode)
    )) as LoadCampaignByCodeResponse

    if (!result.success || !result.campaign) {
      return new ValidateDmPinResponse(req.correlationId, null, 'Campaign not found')
    }

    // We compare hashes server-side via the API route; here we just return the campaign
    // so the API route can do the hash comparison with the stored dm_pin_hash.
    // The plain-text PIN never leaves the API route.
    return new ValidateDmPinResponse(req.correlationId, result.campaign)
  }
}
