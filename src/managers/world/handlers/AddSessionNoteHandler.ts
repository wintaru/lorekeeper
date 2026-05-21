import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { StoreSessionNoteRequest } from '@/accessors/world/WorldRequests'
import { StoreSessionNoteResponse } from '@/accessors/world/WorldResponses'
import { AddSessionNoteRequest } from '../WorldRequests'
import { SessionNoteResponse } from '../WorldResponses'

export class AddSessionNoteHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as AddSessionNoteRequest
    const result = (await this.worldAccessor.store(
      new StoreSessionNoteRequest(req.campaignId, req.note)
    )) as StoreSessionNoteResponse

    if (!result.success || !result.note) {
      return new SessionNoteResponse(req.correlationId, null, result.errorMessage ?? 'Failed to add session note')
    }
    return new SessionNoteResponse(req.correlationId, result.note)
  }
}
