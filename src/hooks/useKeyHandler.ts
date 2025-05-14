import { useAppContext } from '@/contexts/AppContext'
import { CompareUtils } from '@/utils/compare-utils'
import { type KeyboardEvent, useEffect } from 'react'

export default function useKeyHandler(
  handler: (event: KeyboardEvent) => void,
  deactivated?: boolean,
) {
  const { lastKeyDown, oldKeyDown, setOldKeyDown } = useAppContext()

  useEffect(() => {
    if (
      !deactivated &&
      lastKeyDown &&
      CompareUtils.IsNewKeyEvent(oldKeyDown, lastKeyDown)
    ) {
      const keyDownEvent = lastKeyDown
      setOldKeyDown(keyDownEvent)
      handler(keyDownEvent)
    }
  }, [lastKeyDown])
}
