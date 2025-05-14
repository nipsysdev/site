import { useEffect } from 'react'
import { useTerminalContext } from '@/contexts/TerminalContext'
import { CompareUtils } from '@/utils/compare-utils'
import { AppRoute, ViewRoute } from '@/types/routing'

export default function useTermRouter(
  listenRoute: ViewRoute,
  handler: (appRoute: AppRoute) => void,
) {
  const { lastRouteReq, oldRouteReq, setOldRouteReq } = useTerminalContext()

  useEffect(() => {
    if (
      lastRouteReq &&
      lastRouteReq.viewRoute === listenRoute &&
      CompareUtils.IsNewRouteEvent(oldRouteReq, lastRouteReq)
    ) {
      const appRoute = lastRouteReq
      setOldRouteReq(appRoute)
      handler(appRoute)
    }
  }, [handler, lastRouteReq, listenRoute, oldRouteReq, setOldRouteReq])
}
