import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { StoreNpcRequest } from '@/accessors/world/WorldRequests'
import { StoreNpcResponse } from '@/accessors/world/WorldResponses'
import { AddNpcRequest } from '../WorldRequests'
import { NpcResponse } from '../WorldResponses'

export class AddNpcHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as AddNpcRequest
    const result = (await this.worldAccessor.store(
      new StoreNpcRequest(req.campaignId, req.name, req.faction, req.lastLocation, req.notes, req.relationships)
    )) as StoreNpcResponse

    if (!result.success || !result.npc) {
      return new NpcResponse(req.correlationId, null, result.errorMessage ?? 'Failed to add NPC')
    }
    return new NpcResponse(req.correlationId, result.npc)
  }
}
