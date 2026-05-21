import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import type { INotificationAccessor } from '@/accessors/notification/INotificationAccessor'
import { LoadCharacterRequest } from '@/accessors/character/CharacterRequests'
import { LoadCharacterResponse } from '@/accessors/character/CharacterResponses'
import { SendPushRequest } from '@/accessors/notification/NotificationRequests'
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

    const character = loadResult.character

    if (!character.pushSubscription) {
      return new WhisperResponse(req.correlationId, false, 'Character has no push subscription')
    }

    const pushResult = await this.notificationAccessor.send(
      new SendPushRequest(
        character.pushSubscription,
        'DM Message',
        req.message,
        {},
      )
    )

    return new WhisperResponse(req.correlationId, pushResult.success, pushResult.success ? undefined : (pushResult.errorMessage ?? 'Push failed'))
  }
}
