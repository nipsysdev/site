import { AppRoute } from '@/types/routing'
import { KeyboardEvent } from 'react'

export class CompareUtils {
  static IsNewRouteEvent(
    oldEvent?: AppRoute | null,
    newEvent?: AppRoute | null,
  ): boolean {
    return (
      !!newEvent &&
      (!oldEvent ||
        oldEvent.viewRoute !== newEvent.viewRoute ||
        oldEvent.param !== newEvent.param ||
        oldEvent.timeStamp !== newEvent.timeStamp)
    )
  }

  static IsNewKeyEvent(
    oldEvent?: KeyboardEvent | null,
    newEvent?: KeyboardEvent | null,
  ): boolean {
    return (
      !!newEvent &&
      (!oldEvent ||
        oldEvent.key !== newEvent.key ||
        oldEvent.timeStamp !== newEvent.timeStamp)
    )
  }
}
