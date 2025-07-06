import { useEffect } from "react";
import { useTerminalContext } from "@/contexts/TerminalContext";
import type { AppRoute, ViewRoute } from "@/types/routing";
import { isNewRouteEvent } from "@/utils/compare-utils";

export default function useTermRouter(
  listenRoute: ViewRoute,
  handler: (appRoute: AppRoute) => void
) {
  const { lastRouteReq, oldRouteReq, setOldRouteReq } = useTerminalContext();

  useEffect(() => {
    if (
      lastRouteReq &&
      lastRouteReq.viewRoute === listenRoute &&
      isNewRouteEvent(oldRouteReq, lastRouteReq)
    ) {
      const appRoute = lastRouteReq;
      setOldRouteReq(appRoute);
      handler(appRoute);
    }
  }, [handler, lastRouteReq, listenRoute, oldRouteReq, setOldRouteReq]);
}
