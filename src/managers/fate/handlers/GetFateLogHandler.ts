import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IFateAccessor } from '@/accessors/fate/IFateAccessor'
import { LoadFateLogRequest, LoadPendingFateRequest } from '@/accessors/fate/FateRequests'
import { LoadFateLogResponse } from '@/accessors/fate/FateResponses'
import { GetFateLogRequest, GetPendingFateRequest } from '../FateRequests'
import { GetFateLogResponse } from '../FateResponses'

export class GetFateLogHandler implements IHandler {
  constructor(private readonly fateAccessor: IFateAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetFateLogRequest
    const result = (await this.fateAccessor.load(
      new LoadFateLogRequest(req.campaignId, req.limit, req.characterId)
    )) as LoadFateLogResponse

    if (!result.success) {
      return new GetFateLogResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load fate log')
    }
    return new GetFateLogResponse(req.correlationId, result.events)
  }
}

export class GetPendingFateHandler implements IHandler {
  constructor(private readonly fateAccessor: IFateAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetPendingFateRequest
    const result = (await this.fateAccessor.load(
      new LoadPendingFateRequest(req.campaignId)
    )) as LoadFateLogResponse

    if (!result.success) {
      return new GetFateLogResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load pending fate')
    }
    return new GetFateLogResponse(req.correlationId, result.events)
  }
}
