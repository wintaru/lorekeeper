import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { RemoveSessionNoteRequest } from '../WorldRequests'
import { RemoveSessionNoteResponse } from '../WorldResponses'

export class RemoveSessionNoteHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as RemoveSessionNoteRequest
    const { error } = await this.db
      .from('session_notes')
      .delete()
      .eq('id', req.noteId)

    if (error) {
      return new RemoveSessionNoteResponse(req.correlationId, false, error.message)
    }
    return new RemoveSessionNoteResponse(req.correlationId, true)
  }
}
