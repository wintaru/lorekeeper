import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LoadRosterRequest } from '../CharacterRequests'
import { LoadRosterResponse } from '../CharacterResponses'
import type { Character } from '@/types'

export class LoadRosterHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadRosterRequest
    const { data, error } = await this.db
      .from('characters')
      .select()
      .eq('campaign_id', req.campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      return new LoadRosterResponse(req.correlationId, [], error.message)
    }

    return new LoadRosterResponse(req.correlationId, (data ?? []).map(rowToCharacter))
  }
}

function rowToCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    playerName: row.player_name as string,
    characterName: row.character_name as string,
    class: row.class as string,
    level: row.level as number,
    maxHp: row.max_hp as number,
    currentHp: row.current_hp as number,
    armorClass: row.armor_class as number,
    deathSaves: (row.death_saves as Character['deathSaves']) ?? { successes: 0, failures: 0 },
    spellSlots: (row.spell_slots as Character['spellSlots']) ?? [],
    conditions: (row.conditions as Character['conditions']) ?? [],
    loot: (row.loot as Character['loot']) ?? [],
    pushSubscription: (row.push_subscription as Character['pushSubscription']) ?? null,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
  }
}
