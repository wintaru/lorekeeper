import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { ICombatManager } from './ICombatManager'

export class CombatManager implements ICombatManager {
  constructor(
    private readonly executeResolver: HandlerResolver,
    private readonly queryResolver: HandlerResolver,
  ) {}

  async execute(request: RequestBase): Promise<ResponseBase> {
    return this.executeResolver.resolve(request)
  }

  async query(request: RequestBase): Promise<ResponseBase> {
    return this.queryResolver.resolve(request)
  }
}
