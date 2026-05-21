import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreSessionNoteRequest } from '../WorldRequests'
import { StoreSessionNoteResponse } from '../WorldResponses'
import type { SessionNote } from '@/types'

export class StoreSessionNoteHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreSessionNoteRequest
    const { data, error } = await this.db
      .from('session_notes')
      .insert({
        campaign_id: req.campaignId,
        note: req.note,
      })
      .select()
      .single()

    if (error || !data) {
      return new StoreSessionNoteResponse(req.correlationId, null, error?.message ?? 'Insert failed')
    }
    return new StoreSessionNoteResponse(req.correlationId, rowToSessionNote(data))
  }
}

export function rowToSessionNote(row: Record<string, unknown>): SessionNote {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    note: row.note as string,
    createdAt: new Date(row.created_at as string),
  }
}
