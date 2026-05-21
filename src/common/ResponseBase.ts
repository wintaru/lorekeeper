export abstract class ResponseBase {
  abstract readonly correlationId: string
  abstract readonly success: boolean
  abstract readonly errorMessage: string | null
}
