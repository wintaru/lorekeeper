import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadInitiativeRequestRequest } from '../CombatRequests'
import { LoadInitiativeRequestResponse } from '../CombatResponses'
import type { InitiativeRequest } from '@/types'

export class LoadInitiativeRequestHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadInitiativeRequestRequest

    const { data } = await this.db
      .from('initiative_requests')
      .select()
      .eq('campaign_id', req.campaignId)
      .eq('status', 'pending')
      .maybeSingle()

    if (!data) return new LoadInitiativeRequestResponse(req.correlationId, null)

    return new LoadInitiativeRequestResponse(req.correlationId, rowToInitiativeRequest(data as Record<string, unknown>))
  }
}

function rowToInitiativeRequest(row: Record<string, unknown>): InitiativeRequest {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    status: row.status as 'pending' | 'resolved',
    rolls: (row.rolls as Record<string, number>) ?? {},
    createdAt: new Date(row.created_at as string),
  }
}
