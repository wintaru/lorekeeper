import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { ICharacterAccessor } from './ICharacterAccessor'

export class CharacterAccessor implements ICharacterAccessor {
  constructor(
    private readonly storeResolver: HandlerResolver,
    private readonly loadResolver: HandlerResolver,
  ) {}

  async store(request: RequestBase): Promise<ResponseBase> {
    return this.storeResolver.resolve(request)
  }

  async load(request: RequestBase): Promise<ResponseBase> {
    return this.loadResolver.resolve(request)
  }
}
