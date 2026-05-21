import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'

export interface ICharacterManager {
  execute(request: RequestBase): Promise<ResponseBase>
}
