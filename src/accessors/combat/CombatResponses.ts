import { ResponseBase } from '@/common/ResponseBase'
import type { CombatSession } from '@/types'

export class StoreCombatSessionResponse extends ResponseBase {
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

export class LoadCombatSessionResponse extends ResponseBase {
  readonly correlationId: string
  readonly success: boolean
  readonly errorMessage: string | null
  readonly session: CombatSession | null

  // success = true even when session is null (no active combat is a valid state)
  constructor(correlationId: string, session: CombatSession | null, errorMessage?: string) {
    super()
    this.correlationId = correlationId
    this.session = session
    this.success = errorMessage === undefined
    this.errorMessage = errorMessage ?? null
  }
}

export class UpdateCombatSessionResponse extends ResponseBase {
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
