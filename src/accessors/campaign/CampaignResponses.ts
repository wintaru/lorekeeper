import { ResponseBase } from '@/common/ResponseBase'
import type { Campaign } from '@/types'

export class StoreCampaignResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly campaign: Campaign | null

  constructor(correlationId: string, campaign: Campaign | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.campaign = campaign
    this.success = campaign !== null
    this.errorMessage = errorMessage ?? null
  }
}

export class LoadCampaignByCodeResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly campaign: Campaign | null

  constructor(correlationId: string, campaign: Campaign | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.campaign = campaign
    this.success = campaign !== null
    this.errorMessage = errorMessage ?? null
  }
}
