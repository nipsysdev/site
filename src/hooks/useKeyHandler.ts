import type { KeyboardEvent } from "react";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { isNewKeyEvent } from "@/utils/compare-utils";

export default function useKeyHandler(
  handler: (event: KeyboardEvent) => void,
  deactivated?: boolean
) {
  const { lastKeyDown, oldKeyDown, setOldKeyDown } = useAppContext();

  useEffect(() => {
    if (!deactivated && lastKeyDown && isNewKeyEvent(oldKeyDown, lastKeyDown)) {
      const keyDownEvent = lastKeyDown;
      setOldKeyDown(keyDownEvent);
      handler(keyDownEvent);
    }
  }, [lastKeyDown, deactivated, handler, oldKeyDown, setOldKeyDown]);
}
