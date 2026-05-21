import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { IWorldAccessor } from './IWorldAccessor'

export class WorldAccessor implements IWorldAccessor {
  constructor(
    private readonly storeResolver: HandlerResolver,
    private readonly loadResolver: HandlerResolver,
    private readonly removeResolver: HandlerResolver,
  ) {}

  async store(request: RequestBase): Promise<ResponseBase> {
    return this.storeResolver.resolve(request)
  }

  async load(request: RequestBase): Promise<ResponseBase> {
    return this.loadResolver.resolve(request)
  }

  async remove(request: RequestBase): Promise<ResponseBase> {
    return this.removeResolver.resolve(request)
  }
}
