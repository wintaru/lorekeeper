import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import type { INotificationAccessor } from '@/accessors/notification/INotificationAccessor'
import { LoadCharacterRequest } from '@/accessors/character/CharacterRequests'
import { LoadCharacterResponse } from '@/accessors/character/CharacterResponses'
import { SendPushRequest, StoreWhisperRequest } from '@/accessors/notification/NotificationRequests'
import { WhisperRequest } from '../CharacterRequests'
import { WhisperResponse } from '../CharacterResponses'

export class WhisperHandler implements IHandler {
  constructor(
    private readonly characterAccessor: ICharacterAccessor,
    private readonly notificationAccessor: INotificationAccessor,
  ) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as WhisperRequest

    const loadResult = (await this.characterAccessor.load(
      new LoadCharacterRequest(req.characterId)
    )) as LoadCharacterResponse

    if (!loadResult.success || !loadResult.character) {
      return new WhisperResponse(req.correlationId, false, loadResult.errorMessage ?? 'Character not found')
    }

    // Persist the whisper to the DB — this is the reliable delivery path.
    // Supabase Realtime will push it to the player's page regardless of push notification status.
    const storeResult = await this.notificationAccessor.store(
      new StoreWhisperRequest(req.characterId, req.message)
    )

    if (!storeResult.success) {
      return new WhisperResponse(req.correlationId, false, storeResult.errorMessage ?? 'Failed to store whisper')
    }

    // Best-effort push notification — failure is non-fatal since the DB record is the source of truth.
    const character = loadResult.character
    if (character.pushSubscription) {
      await this.notificationAccessor.send(
        new SendPushRequest(character.pushSubscription, 'DM Whisper', req.message, {})
      )
    }

    return new WhisperResponse(req.correlationId, true)
  }
}
