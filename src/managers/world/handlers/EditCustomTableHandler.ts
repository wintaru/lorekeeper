import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { UpdateCustomTableRequest } from '@/accessors/world/WorldRequests'
import { StoreCustomTableResponse } from '@/accessors/world/WorldResponses'
import { EditCustomTableRequest } from '../WorldRequests'
import { CustomTableResponse } from '../WorldResponses'

export class EditCustomTableHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as EditCustomTableRequest
    const result = (await this.worldAccessor.store(
      new UpdateCustomTableRequest(req.tableId, req.name, req.entries)
    )) as StoreCustomTableResponse

    if (!result.success || !result.table) {
      return new CustomTableResponse(req.correlationId, null, result.errorMessage ?? 'Failed to update table')
    }
    return new CustomTableResponse(req.correlationId, result.table)
  }
}
