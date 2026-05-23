import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateInitiativeRollsRequest } from '../CombatRequests'
import { UpdateInitiativeRollsResponse } from '../CombatResponses'

export class UpdateInitiativeRollsHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateInitiativeRollsRequest

    const { data } = await this.db
      .from('initiative_requests')
      .select('rolls')
      .eq('campaign_id', req.campaignId)
      .eq('status', 'pending')
      .single()

    if (!data) {
      return new UpdateInitiativeRollsResponse(req.correlationId, 'No pending initiative request')
    }

    const updatedRolls = { ...(data.rolls as Record<string, number>), [req.characterId]: req.roll }

    const { error } = await this.db
      .from('initiative_requests')
      .update({ rolls: updatedRolls })
      .eq('campaign_id', req.campaignId)
      .eq('status', 'pending')

    if (error) return new UpdateInitiativeRollsResponse(req.correlationId, error.message)

    return new UpdateInitiativeRollsResponse(req.correlationId)
  }
}
