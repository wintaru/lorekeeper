import { RequestBase } from '@/common/RequestBase'

export class StoreCampaignRequest extends RequestBase {
  constructor(
    public readonly code: string,
    public readonly dmPinHash: string,
  ) { super() }
}

export class LoadCampaignByCodeRequest extends RequestBase {
  constructor(public readonly code: string) { super() }
}
