import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { ICampaignAccessor } from './ICampaignAccessor'

export class CampaignAccessor implements ICampaignAccessor {
  constructor(
    private readonly storeResolver: HandlerResolver,
    private readonly loadResolver: HandlerResolver,
  ) {}

  async store(request: RequestBase): Promise<ResponseBase> {
    return this.storeResolver.resolve(request)
  }

  async load(request: RequestBase): Promise<ResponseBase> {
    return this.loadResolver.resolve(request)
  }
}
