import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'

export interface IXpEngine {
  evaluate(request: RequestBase): Promise<ResponseBase>
}
