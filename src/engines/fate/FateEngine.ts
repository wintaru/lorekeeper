import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { IFateEngine } from './IFateEngine'

export class FateEngine implements IFateEngine {
  constructor(private readonly evaluateResolver: HandlerResolver) {}

  async evaluate(request: RequestBase): Promise<ResponseBase> {
    return this.evaluateResolver.resolve(request)
  }
}
