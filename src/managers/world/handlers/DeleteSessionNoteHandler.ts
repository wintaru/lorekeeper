import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { IWorldAccessor } from '@/accessors/world/IWorldAccessor'
import { RemoveSessionNoteRequest } from '@/accessors/world/WorldRequests'
import { RemoveSessionNoteResponse } from '@/accessors/world/WorldResponses'
import { DeleteSessionNoteRequest } from '../WorldRequests'
import { DeleteResponse } from '../WorldResponses'

export class DeleteSessionNoteHandler implements IHandler {
  constructor(private readonly worldAccessor: IWorldAccessor) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as DeleteSessionNoteRequest
    const result = (await this.worldAccessor.remove(
      new RemoveSessionNoteRequest(req.noteId)
    )) as RemoveSessionNoteResponse

    if (!result.success) {
      return new DeleteResponse(req.correlationId, false, result.errorMessage ?? 'Failed to delete session note')
    }
    return new DeleteResponse(req.correlationId, true)
  }
}
