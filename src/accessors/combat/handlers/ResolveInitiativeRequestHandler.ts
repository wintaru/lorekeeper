import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ResolveInitiativeRequestRequest } from '../CombatRequests'
import { ResolveInitiativeRequestResponse } from '../CombatResponses'

export class ResolveInitiativeRequestHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as ResolveInitiativeRequestRequest

    const { error } = await this.db
      .from('initiative_requests')
      .update({ status: 'resolved' })
      .eq('campaign_id', req.campaignId)
      .eq('status', 'pending')

    if (error) return new ResolveInitiativeRequestResponse(req.correlationId, error.message)

    return new ResolveInitiativeRequestResponse(req.correlationId)
  }
}
