import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadFateLogRequest } from '../FateRequests'
import { LoadFateLogResponse } from '../FateResponses'
import type { FateEvent } from '@/types'

export class LoadFateLogHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadFateLogRequest
    let query = this.db
      .from('fate_events')
      .select()
      .eq('campaign_id', req.campaignId)
      .not('revealed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(req.limit)

    if (req.characterId) {
      query = query.eq('target_character_id', req.characterId)
    }

    const { data, error } = await query

    if (error) {
      return new LoadFateLogResponse(req.correlationId, [], error.message)
    }
    return new LoadFateLogResponse(req.correlationId, (data ?? []).map(rowToFateEvent))
  }
}

export class LoadPendingFateHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadFateLogRequest
    const { data, error } = await this.db
      .from('fate_events')
      .select()
      .eq('campaign_id', req.campaignId)
      .is('revealed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return new LoadFateLogResponse(req.correlationId, [], error.message)
    }
    return new LoadFateLogResponse(req.correlationId, (data ?? []).map(rowToFateEvent))
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
