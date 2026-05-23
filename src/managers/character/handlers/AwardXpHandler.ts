import type { IHandler } from '@/common/resolver/IHandler'
import type { RequestBase } from '@/common/RequestBase'
import type { ResponseBase } from '@/common/ResponseBase'
import type { ICharacterAccessor } from '@/accessors/character/ICharacterAccessor'
import type { IXpEngine } from '@/engines/xp/IXpEngine'
import type { INotificationAccessor } from '@/accessors/notification/INotificationAccessor'
import { LoadCharacterRequest, UpdateXpRequest } from '@/accessors/character/CharacterRequests'
import { LoadCharacterResponse } from '@/accessors/character/CharacterResponses'
import { CalculateLevelRequest } from '@/engines/xp/XpEngineRequests'
import { CalculateLevelResponse } from '@/engines/xp/XpEngineResponses'
import { SendPushRequest } from '@/accessors/notification/NotificationRequests'
import { AwardXpRequest } from '../CharacterRequests'
import { AwardXpResponse } from '../CharacterResponses'

export class AwardXpHandler implements IHandler {
  constructor(
    private readonly characterAccessor: ICharacterAccessor,
    private readonly xpEngine: IXpEngine,
    private readonly notificationAccessor: INotificationAccessor,
  ) {}

  async handle(request: RequestBase): Promise<ResponseBase> {
    const req = request as AwardXpRequest

    // Load character
    const loadResult = (await this.characterAccessor.load(
      new LoadCharacterRequest(req.characterId)
    )) as LoadCharacterResponse

    if (!loadResult.success || !loadResult.character) {
      return new AwardXpResponse(req.correlationId, 0, 0, false, loadResult.errorMessage ?? 'Character not found')
    }

    const character = loadResult.character

    // Calculate old level
    const oldLevelResult = (await this.xpEngine.evaluate(
      new CalculateLevelRequest(character.xp)
    )) as CalculateLevelResponse

    // Calculate new xp and new level (floor at 0)
    const newXp = Math.max(0, character.xp + req.xpToAdd)
    const newLevelResult = (await this.xpEngine.evaluate(
      new CalculateLevelRequest(newXp)
    )) as CalculateLevelResponse

    const newLevel = newLevelResult.level
    const leveledUp = newLevel > oldLevelResult.level

    // Persist
    const updateResult = await this.characterAccessor.store(
      new UpdateXpRequest(req.characterId, newXp, newLevel)
    )

    if (!updateResult.success) {
      return new AwardXpResponse(req.correlationId, 0, 0, false, updateResult.errorMessage ?? 'Failed to update XP')
    }

    // Push notification on level-up
    if (leveledUp && character.pushSubscription) {
      await this.notificationAccessor.send(
        new SendPushRequest(
          character.pushSubscription,
          'Level Up!',
          `${character.characterName} is now level ${newLevel}!`,
        )
      )
    }

    return new AwardXpResponse(req.correlationId, newXp, newLevel, leveledUp)
  }
}
