import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { UpdateNpcRequest } from '@/accessors/world/WorldRequests'
import { StoreNpcResponse } from '@/accessors/world/WorldResponses'
import { EditNpcRequest } from '../WorldRequests'
import { NpcResponse } from '../WorldResponses'

export class EditNpcHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as EditNpcRequest
    const result = (await this.worldAccessor.store(
      new UpdateNpcRequest(req.npcId, req.name, req.faction, req.lastLocation, req.notes, req.relationships)
    )) as StoreNpcResponse

    if (!result.success || !result.npc) {
      return new NpcResponse(req.correlationId, null, result.errorMessage ?? 'Failed to edit NPC')
    }
    return new NpcResponse(req.correlationId, result.npc)
  }
}
