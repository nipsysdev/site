'use client';

import { useEffect, useState } from 'react';

interface UseIpnsCidResult {
  cid: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Resolves an IPNS name to its current IPFS CID client-side.
 *
 * Uses my personal gateway and reads the `x-ipfs-roots` response
 * header (CORS-exposed) to extract the resolved root CID.
 */
export function useIpnsCid(ipnsName: string | undefined): UseIpnsCidResult {
  const [cid, setCid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ipnsName) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    setIsLoading(true);
    setError(null);

    fetch(`https://ipfs.nipsys.dev/ipns/${ipnsName}/`, {
      method: 'GET',
      signal: controller.signal,
    })
      .then((res) => {
        const roots = res.headers.get('x-ipfs-roots');
        if (!roots) {
          throw new Error('No x-ipfs-roots header in response');
        }
        // x-ipfs-roots is comma-separated; first entry is the resolved root CID
        const resolvedCid = roots.split(',')[0].trim();
        if (!cancelled) {
          setCid(resolvedCid);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Resolution failed');
          setIsLoading(false);
        }
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [ipnsName]);

  return { cid, isLoading, error };
}
