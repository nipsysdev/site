import type { KeyboardEvent } from "react";
import type { AppRoute } from "@/types/routing";

export function isNewRouteEvent(
  oldEvent?: AppRoute | null,
  newEvent?: AppRoute | null
): boolean {
  return (
    !!newEvent &&
    (!oldEvent ||
      oldEvent.viewRoute !== newEvent.viewRoute ||
      oldEvent.param !== newEvent.param ||
      oldEvent.timeStamp !== newEvent.timeStamp)
  );
}

export function isNewKeyEvent(
  oldEvent?: KeyboardEvent | null,
  newEvent?: KeyboardEvent | null
): boolean {
  return (
    !!newEvent &&
    (!oldEvent ||
      oldEvent.key !== newEvent.key ||
      oldEvent.timeStamp !== newEvent.timeStamp)
  );
}
