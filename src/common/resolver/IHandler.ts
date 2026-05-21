import type { RequestBase } from '../RequestBase'
import type { ResponseBase } from '../ResponseBase'

export interface IHandler {
  handle(request: RequestBase): Promise<ResponseBase>
}
