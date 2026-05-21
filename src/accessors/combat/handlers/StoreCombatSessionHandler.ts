import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreCombatSessionRequest } from '../CombatRequests'
import { StoreCombatSessionResponse } from '../CombatResponses'
import type { CombatSession, InitiativeEntry } from '@/types'

export class StoreCombatSessionHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreCombatSessionRequest
    const { data, error } = await this.db
      .from('combat_sessions')
      .insert({
        campaign_id: req.campaignId,
        initiative_order: req.initiativeOrder,
      })
      .select()
      .single()

    if (error) {
      return new StoreCombatSessionResponse(req.correlationId, null, error.message)
    }

    return new StoreCombatSessionResponse(req.correlationId, rowToCombatSession(data as Record<string, unknown>))
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
