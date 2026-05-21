import type { RequestBase } from '../RequestBase'
import type { IHandler } from './IHandler'
import { HandlerResolver } from './HandlerResolver'

export class HandlerResolverBuilder {
  private readonly handlers: Map<string, IHandler> = new Map()

  register(requestType: new (...args: never[]) => RequestBase, handler: IHandler): this {
    this.handlers.set(requestType.name, handler)
    return this
  }

  build(): HandlerResolver {
    return new HandlerResolver(new Map(this.handlers))
  }
}
