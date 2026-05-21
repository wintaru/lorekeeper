import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { StoreCustomTableRequest } from '@/accessors/world/WorldRequests'
import { StoreCustomTableResponse } from '@/accessors/world/WorldResponses'
import { AddCustomTableRequest } from '../WorldRequests'
import { CustomTableResponse } from '../WorldResponses'

export class AddCustomTableHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as AddCustomTableRequest
    const result = (await this.worldAccessor.store(
      new StoreCustomTableRequest(req.campaignId, req.name, req.entries)
    )) as StoreCustomTableResponse

    if (!result.success || !result.table) {
      return new CustomTableResponse(req.correlationId, null, result.errorMessage ?? 'Failed to add table')
    }
    return new CustomTableResponse(req.correlationId, result.table)
  }
}
