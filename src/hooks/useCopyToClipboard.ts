import { useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, key: string = 'default') => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 200);
  };

  const copyWithToast = async (
    text: string,
    toastMessage: string,
    key: string = 'default',
  ) => {
    await copy(text, key);
    toast.success(toastMessage);
  };

  const isCopied = (key: string = 'default') => copiedKey === key;

  return { copy, copyWithToast, isCopied };
}
