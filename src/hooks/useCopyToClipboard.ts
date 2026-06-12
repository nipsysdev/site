import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (text: string, key: string = 'default') => {
    await navigator.clipboard.writeText(text);
    if (mountedRef.current) {
      setCopiedKey(key);
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setCopiedKey(null);
        }
      }, 200);
    }
  }, []);

  const copyWithToast = useCallback(
    async (text: string, toastMessage: string, key: string = 'default') => {
      await copy(text, key);
      toast.success(toastMessage);
    },
    [copy],
  );

  const isCopied = useCallback(
    (key: string = 'default') => copiedKey === key,
    [copiedKey],
  );

  return { copy, copyWithToast, isCopied };
}
