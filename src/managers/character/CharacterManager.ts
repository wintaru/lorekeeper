import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import { HandlerResolver } from '@/common/resolver/HandlerResolver'
import type { ICharacterManager } from './ICharacterManager'

export class CharacterManager implements ICharacterManager {
  constructor(private readonly executeResolver: HandlerResolver) {}

  async execute(request: RequestBase): Promise<ResponseBase> {
    return this.executeResolver.resolve(request)
  }
}
