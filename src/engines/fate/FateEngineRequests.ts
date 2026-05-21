import { RequestBase } from '@/common/RequestBase'
import type { FatePoolEntry } from '@/types'

export class SelectTargetRequest extends RequestBase {
  constructor(public readonly pool: FatePoolEntry[]) { super() }
}
