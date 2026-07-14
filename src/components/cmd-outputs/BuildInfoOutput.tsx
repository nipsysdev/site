'use client';

import { Button, Typography } from '@nipsys/lsd';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Fragment, type JSX } from 'react';
import { useIpnsCid } from '@/hooks/useIpnsCid';

const IPNS_HASH = process.env.IPNS_HASH;
const REPO_URL = 'https://github.com/nipsysdev/site';

interface NamedGateway {
  label: string;
  url: string;
}

interface PublicGateway {
  label: string;
  ipnsUrl: string;
  cidUrlPattern: (cid: string) => string;
}

export default function BuildInfoOutput() {
  const t = useTranslations('BuildInfo');
  const buildTimestamp = process.env.BUILD_TIMESTAMP;
  const buildCommit = process.env.BUILD_COMMIT;
  const { cid, isLoading } = useIpnsCid(IPNS_HASH);

  const namedGateways: NamedGateway[] = [
    {
      label: 'gwei.site',
      url: 'https://xav.gwei.site',
    },
    {
      label: 'eth.limo',
      url: 'https://nipsys.eth.limo',
    },
  ];

  const publicGateways: PublicGateway[] = [
    {
      label: 'dweb.link',
      ipnsUrl: IPNS_HASH ? `https://${IPNS_HASH}.ipns.dweb.link` : '#',
      cidUrlPattern: (resolvedCid) => `https://${resolvedCid}.ipfs.dweb.link`,
    },
    {
      label: 'ipfs.io',
      ipnsUrl: IPNS_HASH ? `https://ipfs.io/ipns/${IPNS_HASH}` : '#',
      cidUrlPattern: (resolvedCid) => `https://ipfs.io/ipfs/${resolvedCid}`,
    },
  ];

  const cell = (title: string, content?: JSX.Element | string) => (
    <div className="flex flex-col gap-y-(--lsd-spacing-smallest)">
      <Typography variant="body3" color="secondary">
        {title}
      </Typography>
      {content && <Typography variant="body2">{content}</Typography>}
    </div>
  );

  return (
    <div
      className="flex flex-col gap-(--lsd-spacing-small) py-(--lsd-spacing-small)"
      data-prevent-terminal-focus
    >
      <div className="grid grid-cols-2 gap-y-(--lsd-spacing-small) w-fit">
        {cell(
          t('buildTimeLabel'),
          buildTimestamp
            ? new Date(buildTimestamp).toLocaleString()
            : t('unknown'),
        )}
        {cell(
          t('commitLabel'),
          buildCommit && buildCommit !== 'unknown' ? (
            <Button
              variant="link"
              className="font-bold p-0! h-fit! text-sm!"
              asChild
            >
              <Link href={`${REPO_URL}/commit/${buildCommit}`} target="_blank">
                {buildCommit}
              </Link>
            </Button>
          ) : (
            t('unknown')
          ),
        )}
        <div className="col-span-2">
          {cell(
            t('ipfsCid'),
            isLoading ? t('cidResolving') : cid ? cid : t('cidUnavailable'),
          )}
        </div>
        {IPNS_HASH && (
          <div className="col-span-2">{cell(t('ipnsName'), IPNS_HASH)}</div>
        )}

        <div className="col-span-2">{cell(t('gateways'))}</div>

        {namedGateways.map((g) => (
          <Fragment key={g.label}>
            {cell(g.label)}
            <Button
              variant="link"
              className="font-bold p-0! h-fit! text-sm! w-fit!"
              asChild
            >
              <Link href={g.url} target="_blank">
                {g.url.replace('https://', '')}
              </Link>
            </Button>
          </Fragment>
        ))}

        {publicGateways.map((g) => (
          <Fragment key={g.label}>
            {cell(g.label)}
            <div className="flex items-center gap-(--lsd-spacing-small)">
              {cid && (
                <Button
                  variant="link"
                  className="font-bold p-0! h-fit! text-sm!"
                  asChild
                >
                  <Link href={g.cidUrlPattern(cid)} target="_blank">
                    IPFS CID
                  </Link>
                </Button>
              )}
              <Button
                variant="link"
                className="font-bold p-0! h-fit! text-sm!"
                asChild
              >
                <Link href={g.ipnsUrl} target="_blank">
                  IPNS Name
                </Link>
              </Button>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
