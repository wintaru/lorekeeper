import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreInitiativeRequestRequest } from '../CombatRequests'
import { StoreInitiativeRequestResponse } from '../CombatResponses'
import type { InitiativeRequest } from '@/types'

export class StoreInitiativeRequestHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreInitiativeRequestRequest
    const { data, error } = await this.db
      .from('initiative_requests')
      .upsert({ campaign_id: req.campaignId, status: 'pending', rolls: {} }, { onConflict: 'campaign_id' })
      .select()
      .single()

    if (error) return new StoreInitiativeRequestResponse(req.correlationId, null, error.message)

    return new StoreInitiativeRequestResponse(req.correlationId, rowToInitiativeRequest(data as Record<string, unknown>))
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
