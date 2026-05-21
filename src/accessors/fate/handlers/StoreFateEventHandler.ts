import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreFateEventRequest } from '../FateRequests'
import { StoreFateEventResponse } from '../FateResponses'
import type { FateEvent } from '@/types'

export class StoreFateEventHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreFateEventRequest
    const { data, error } = await this.db
      .from('fate_events')
      .insert({
        campaign_id: req.campaignId,
        event_type: req.eventType,
        target_character_id: req.targetCharacterId,
        dm_note: req.dmNote,
      })
      .select()
      .single()

    if (error || !data) {
      return new StoreFateEventResponse(req.correlationId, null, error?.message ?? 'Insert failed')
    }
    return new StoreFateEventResponse(req.correlationId, rowToFateEvent(data))
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
