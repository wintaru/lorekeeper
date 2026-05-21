import { RequestBase } from '@/common/RequestBase'

export class CalculateLevelRequest extends RequestBase {
  constructor(public readonly xp: number) { super() }
}
