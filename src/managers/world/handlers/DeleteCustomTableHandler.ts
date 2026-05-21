import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { RemoveCustomTableRequest } from '@/accessors/world/WorldRequests'
import { RemoveCustomTableResponse } from '@/accessors/world/WorldResponses'
import { DeleteCustomTableRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class DeleteCustomTableHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DeleteCustomTableRequest
    const result = (await this.worldAccessor.remove(
      new RemoveCustomTableRequest(req.tableId)
    )) as RemoveCustomTableResponse

    return new DeleteResponse(req.correlationId, result.success, result.errorMessage ?? undefined)
  }
}
