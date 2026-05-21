import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FateEvent } from '@/types'
import { MarkFateRevealedRequest } from '../FateRequests'
import { MarkFateRevealedResponse } from '../FateResponses'

export class MarkFateRevealedHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as MarkFateRevealedRequest
    const { data, error } = await this.db
      .from('fate_events')
      .update({ revealed_at: new Date().toISOString() })
      .eq('id', req.fateEventId)
      .select()
      .single()

    if (error || !data) {
      return new MarkFateRevealedResponse(req.correlationId, null, error?.message ?? 'Reveal failed')
    }
    return new MarkFateRevealedResponse(req.correlationId, rowToFateEvent(data as Record<string, unknown>))
  }
}

function rowToFateEvent(row: Record<string, unknown>): FateEvent {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    eventType: row.event_type as FateEvent['eventType'],
    targetCharacterId: row.target_character_id as string,
    revealedAt: row.revealed_at ? new Date(row.revealed_at as string) : null,
    dmNote: (row.dm_note as string) ?? null,
    createdAt: new Date(row.created_at as string),
  }
}
