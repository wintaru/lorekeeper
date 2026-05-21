import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'

export interface INotificationAccessor {
  send(request: RequestBase): Promise<ResponseBase>
  store(request: RequestBase): Promise<ResponseBase>
}
