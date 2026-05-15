'use client';

import { verifiedFetch } from '@helia/verified-fetch';
import { useEffect, useRef, useState } from 'react';
import { getIcon, setIcon } from '@/lib/dpulse/icon-cache';

// Module-level Map for request deduplication
const pendingRequests = new Map<string, Promise<Blob>>();

/**
 * Fetch and cache an icon from IPFS using helia-verified-fetch.
 * Returns a blob URL for use in an <img> tag, or null if loading/failed.
 *
 * @param cid - The IPFS CID of the icon (optional)
 * @returns Object with blobUrl and loading state
 */
export function useIcon(cid?: string): {
  blobUrl: string | null;
  loading: boolean;
  error: Error | null;
} {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cid) {
      setBlobUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;
    const cidValue = cid;

    async function fetchIcon() {
      try {
        setLoading(true);
        setError(null);

        if (signal.aborted) {
          return;
        }

        const cachedBlob = await getIcon(cidValue);
        if (cachedBlob) {
          if (signal.aborted) {
            return;
          }
          const url = URL.createObjectURL(cachedBlob);
          blobUrlRef.current = url;
          setBlobUrl(url);
          setLoading(false);
          return;
        }

        if (signal.aborted) {
          return;
        }

        let fetchPromise = pendingRequests.get(cidValue);

        if (!fetchPromise) {
          const timeoutPromise = new Promise<never>((_, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Icon fetch timeout after 10 seconds'));
            }, 10000);

            signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
            });
          });

          const responsePromise = verifiedFetch(`ipfs://${cidValue}`, {
            signal,
          })
            .then(async (response) => {
              if (signal.aborted) {
                throw new Error('Request aborted');
              }
              if (!response.ok) {
                throw new Error(`Failed to fetch icon: ${response.status}`);
              }
              const blob = await response.blob();
              return blob;
            })
            .finally(() => {
              pendingRequests.delete(cidValue);
            });

          fetchPromise = Promise.race([responsePromise, timeoutPromise]);
          pendingRequests.set(cidValue, fetchPromise);
        }

        const blob = await fetchPromise;

        if (signal.aborted) {
          return;
        }

        await setIcon(cidValue, blob);

        if (signal.aborted) {
          return;
        }

        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
        setLoading(false);
      } catch (err) {
        if (signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }

    fetchIcon();

    return () => {
      abortController.abort();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
    };
  }, [cid]);

  return { blobUrl, loading, error };
}

/**
 * Hook for rendering service icons from IPFS.
 * Handles integration with dpulse messages.
 *
 * @param cidFromMessage - The iconCid from a dpulse StatusMessage (optional)
 * @returns Props to spread onto an <img> element, or null if icon should not be shown
 */
export function useServiceIconProps(cidFromMessage?: string): {
  src: string;
  alt: string;
  className: string;
} | null {
  const { blobUrl, loading, error } = useIcon(cidFromMessage);

  if (loading || error || !blobUrl) {
    return null;
  }

  return {
    src: blobUrl,
    alt: 'Service icon',
    className: 'size-8 object-contain',
  };
}
