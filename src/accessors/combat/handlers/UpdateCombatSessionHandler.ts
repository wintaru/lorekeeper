import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { UpdateCombatSessionRequest } from '../CombatRequests'
import { UpdateCombatSessionResponse } from '../CombatResponses'
import type { CombatSession, InitiativeEntry } from '@/types'

export class UpdateCombatSessionHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as UpdateCombatSessionRequest

    const patch: Record<string, unknown> = {}
    if (req.updates.initiativeOrder !== undefined) {
      patch.initiative_order = req.updates.initiativeOrder
    }
    if (req.updates.currentTurnIndex !== undefined) {
      patch.current_turn_index = req.updates.currentTurnIndex
    }
    if (req.updates.roundNumber !== undefined) {
      patch.round_number = req.updates.roundNumber
    }
    if (req.updates.isActive !== undefined) {
      patch.is_active = req.updates.isActive
    }

    const { data, error } = await this.db
      .from('combat_sessions')
      .update(patch)
      .eq('id', req.sessionId)
      .select()
      .single()

    if (error) {
      return new UpdateCombatSessionResponse(req.correlationId, null, error.message)
    }

    return new UpdateCombatSessionResponse(req.correlationId, rowToCombatSession(data as Record<string, unknown>))
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
