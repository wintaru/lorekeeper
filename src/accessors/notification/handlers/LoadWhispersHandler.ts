import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Whisper } from '@/types'
import { LoadWhispersRequest } from '../NotificationRequests'
import { LoadWhispersResponse } from '../NotificationResponses'

export class LoadWhispersHandler implements IHandler {
  constructor(private readonly db: SupabaseClient) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as LoadWhispersRequest
    const { data, error } = await this.db
      .from('whispers')
      .select()
      .eq('character_id', req.characterId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return new LoadWhispersResponse(req.correlationId, [], error.message)
    }

    const whispers: Whisper[] = (data ?? []).map(row => ({
      id: row.id as string,
      characterId: row.character_id as string,
      message: row.message as string,
      createdAt: new Date(row.created_at as string),
    }))

    return new LoadWhispersResponse(req.correlationId, whispers)
  }
}
