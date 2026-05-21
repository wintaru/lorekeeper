import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { StoreCharacterRequest } from '../CharacterRequests'
import { StoreCharacterResponse } from '../CharacterResponses'
import type { Character } from '@/types'

export class StoreCharacterHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as StoreCharacterRequest
    const { data, error } = await this.db
      .from('characters')
      .insert({
        campaign_id: req.campaignId,
        player_name: req.playerName,
        character_name: req.characterName,
        class: req.characterClass,
        level: req.level,
        max_hp: req.maxHp,
        current_hp: req.maxHp,
        armor_class: req.armorClass,
        spell_slots: req.spellSlots,
      })
      .select()
      .single()

    if (error || !data) {
      return new StoreCharacterResponse(req.correlationId, null, error?.message ?? 'Insert failed')
    }

    return new StoreCharacterResponse(req.correlationId, rowToCharacter(data))
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
    pushSubscription: (row.push_subscription as Character['pushSubscription']) ?? null,
    isActive: row.is_active as boolean,
    createdAt: new Date(row.created_at as string),
  }
}
