import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'

export interface ICampaignAccessor {
  store(request: RequestBase): Promise<ResponseBase>
  load(request: RequestBase): Promise<ResponseBase>
}
