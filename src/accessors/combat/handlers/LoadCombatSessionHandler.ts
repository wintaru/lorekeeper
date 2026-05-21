import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadCombatSessionRequest } from '../CombatRequests'
import { LoadCombatSessionResponse } from '../CombatResponses'
import type { CombatSession, InitiativeEntry } from '@/types'

export class LoadCombatSessionHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadCombatSessionRequest
    const { data, error } = await this.db
      .from('combat_sessions')
      .select()
      .eq('campaign_id', req.campaignId)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      return new LoadCombatSessionResponse(req.correlationId, null, error.message)
    }

    const session = data ? rowToCombatSession(data as Record<string, unknown>) : null
    return new LoadCombatSessionResponse(req.correlationId, session)
  }
}

function rowToCombatSession(row: Record<string, unknown>): CombatSession {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    initiativeOrder: (row.initiative_order as InitiativeEntry[]) ?? [],
    currentTurnIndex: row.current_turn_index as number,
    roundNumber: row.round_number as number,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
  }
}
