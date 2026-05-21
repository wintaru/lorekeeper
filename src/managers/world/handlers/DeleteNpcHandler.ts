import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { RemoveNpcRequest } from '@/accessors/world/WorldRequests'
import { RemoveNpcResponse } from '@/accessors/world/WorldResponses'
import { DeleteNpcRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class DeleteNpcHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DeleteNpcRequest
    const result = (await this.worldAccessor.remove(
      new RemoveNpcRequest(req.npcId)
    )) as RemoveNpcResponse

    if (!result.success) {
      return new DeleteResponse(req.correlationId, false, result.errorMessage ?? 'Failed to delete NPC')
    }
    return new DeleteResponse(req.correlationId, true)
  }
}
