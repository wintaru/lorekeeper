import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadSessionNotesRequest } from '../WorldRequests'
import { LoadSessionNotesResponse } from '../WorldResponses'
import { rowToSessionNote } from './StoreSessionNoteHandler'

export class LoadSessionNotesHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadSessionNotesRequest
    const { data, error } = await this.db
      .from('session_notes')
      .select()
      .eq('campaign_id', req.campaignId)
      .order('created_at', { ascending: false })
      .limit(req.limit)

    if (error) {
      return new LoadSessionNotesResponse(req.correlationId, [], error.message)
    }
    return new LoadSessionNotesResponse(req.correlationId, (data ?? []).map(rowToSessionNote))
  }
}
