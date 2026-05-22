import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { INotificationAccessor } from './INotificationAccessor'

export class NotificationAccessor implements INotificationAccessor {
  constructor(
    private readonly sendResolver: HandlerResolver,
    private readonly storeResolver: HandlerResolver,
    private readonly loadResolver: HandlerResolver,
  ) {}

  async send(request: RequestBase): Promise<ResponseBase> {
    return this.sendResolver.resolve(request)
  }

  async store(request: RequestBase): Promise<ResponseBase> {
    return this.storeResolver.resolve(request)
  }

  async load(request: RequestBase): Promise<ResponseBase> {
    return this.loadResolver.resolve(request)
  }
}
