import { AppRoute } from '@/types/routing'

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
}
