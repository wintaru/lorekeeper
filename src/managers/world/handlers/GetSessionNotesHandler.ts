import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { LoadSessionNotesRequest } from '@/accessors/world/WorldRequests'
import { LoadSessionNotesResponse } from '@/accessors/world/WorldResponses'
import { GetSessionNotesRequest } from '../WorldRequests'
import { GetSessionNotesResponse } from '../WorldResponses'

export class GetSessionNotesHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as GetSessionNotesRequest
    const result = (await this.worldAccessor.load(
      new LoadSessionNotesRequest(req.campaignId, req.limit)
    )) as LoadSessionNotesResponse

    if (!result.success) {
      return new GetSessionNotesResponse(req.correlationId, [], result.errorMessage ?? 'Failed to load session notes')
    }
    return new GetSessionNotesResponse(req.correlationId, result.notes)
  }
}
