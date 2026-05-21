import type { RequestBase } from '../RequestBase'
import type { ResponseBase } from '../ResponseBase'
import type { IHandler } from './IHandler'
import { UnhandledRequestResponse } from './UnhandledRequestResponse'

export class HandlerResolver {
  private readonly handlers: Map<string, IHandler>

  constructor(handlers: Map<string, IHandler>) {
    this.handlers = handlers
  }

  async resolve(request: RequestBase): Promise<ResponseBase> {
    const key = request.constructor.name
    const handler = this.handlers.get(key)
    if (!handler) {
      return new UnhandledRequestResponse(request.correlationId, key)
    }
    return handler.handle(request)
  }
}
