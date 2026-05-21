import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { IXpEngine } from './IXpEngine'

export class XpEngine implements IXpEngine {
  constructor(private readonly evaluateResolver: HandlerResolver) {}

  async evaluate(request: RequestBase): Promise<ResponseBase> {
    return this.evaluateResolver.resolve(request)
  }
}
