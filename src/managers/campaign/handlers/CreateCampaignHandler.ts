import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICampaignAccessor } from '@/accessors/campaign/ICampaignAccessor'
import { StoreCampaignRequest } from '@/accessors/campaign/CampaignRequests'
import { StoreCampaignResponse } from '@/accessors/campaign/CampaignResponses'
import { CampaignCodeUtility } from '@/utilities/CampaignCodeUtility'
import { CreateCampaignRequest } from '../CampaignRequests'
import { CreateCampaignResponse } from '../CampaignResponses'

export class CreateCampaignHandler implements IHandler {
  constructor(private readonly campaignAccessor: ICampaignAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as CreateCampaignRequest
    const dmPinHash = await hashPin(req.dmPin)
    const code = CampaignCodeUtility.generate()

    const result = (await this.campaignAccessor.store(
      new StoreCampaignRequest(code, dmPinHash)
    )) as StoreCampaignResponse

    if (!result.success || !result.campaign) {
      return new CreateCampaignResponse(req.correlationId, null, result.errorMessage ?? 'Failed to create campaign')
    }
    return new CreateCampaignResponse(req.correlationId, result.campaign)
  }
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
