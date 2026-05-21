import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { LoadCustomTablesRequest } from '@/accessors/world/WorldRequests'
import { LoadCustomTablesResponse } from '@/accessors/world/WorldResponses'
import { GetCustomTablesRequest } from '../WorldRequests'
import { GetCustomTablesResponse } from '../WorldResponses'

export class GetCustomTablesHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetCustomTablesRequest
    const result = (await this.worldAccessor.load(
      new LoadCustomTablesRequest(req.campaignId)
    )) as LoadCustomTablesResponse

    if (!result.success) {
      return new GetCustomTablesResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load tables')
    }
    return new GetCustomTablesResponse(req.correlationId, result.tables)
  }
}
