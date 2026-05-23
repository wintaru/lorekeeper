import { ResponseBase } from '@/common/ResponseBase'
import type { CombatSession, InitiativeRequest } from '@/types'

export class StartCombatResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  constructor(correlationId: string, session: CombatSession | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class EndCombatResponse extends ResponseBase {
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

export class NextTurnResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  constructor(correlationId: string, session: CombatSession | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class GetCombatSessionResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  // Always success — null session means no active combat
  constructor(correlationId: string, session: CombatSession | null) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = true
    this.errorMessage = null
  }
}

export class RequestInitiativeResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly request: InitiativeRequest | null

  constructor(correlationId: string, request: InitiativeRequest | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.request = request
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class GetInitiativeRequestResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly request: InitiativeRequest | null

  constructor(correlationId: string, request: InitiativeRequest | null) {
    super()
    this.correlationId = correlationId
    this.request = request
    this.success = true
    this.errorMessage = null
  }
}

export class SubmitInitiativeRollResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class ResolveInitiativeResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null

  constructor(correlationId: string, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}
