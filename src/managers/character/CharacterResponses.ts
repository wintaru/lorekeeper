import { ResponseBase } from '@/common/ResponseBase'

export class UpdateCharacterResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, success: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = success
    this.errorMessage = errorMessage ?? null
  }
}

export class AwardXpResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly newXp: number
  readonly newLevel: number
  readonly leveledUp: boolean

  constructor(
    correlationId: string,
    newXp: number,
    newLevel: number,
    leveledUp: boolean,
    errorMessage?: string,
  ) {
    super()
    this.correlationId = correlationId
    this.newXp = newXp
    this.newLevel = newLevel
    this.leveledUp = leveledUp
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class WhisperResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly sent: boolean

  constructor(correlationId: string, sent: boolean, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.sent = sent
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}
