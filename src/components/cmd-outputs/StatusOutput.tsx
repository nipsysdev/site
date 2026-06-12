'use client';

import { useStore } from '@nanostores/react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Typography,
} from '@nipsys/lsd';
import { RecordIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useDayjs } from '@/hooks/useDayjs';
import { useIcon } from '@/hooks/useIcon';
import { $isLoading, $statusMessages } from '@/lib/dpulse/stores';
import type { HealthStatus, ServiceStatus } from '@/lib/dpulse/types';
import { getStatusMeta } from '@/lib/dpulse/utils/status';

interface ServiceCardProps {
  statusMsg: ServiceStatus;
  t: (key: string) => string;
  dayjs: ReturnType<typeof useDayjs>;
}

function ServiceCard({ statusMsg, t, dayjs }: ServiceCardProps) {
  const status = statusMsg?.status as HealthStatus;
  const meta = getStatusMeta(status);
  const IconComponent = meta.icon;

  const iconCid = statusMsg?.iconCid;
  const { blobUrl: iconBlobUrl } = useIcon(iconCid);

  return (
    <Card data-prevent-terminal-focus>
      <CardHeader>
        <div className="flex items-center justify-between gap-(--lsd-spacing-small)">
          <CardTitle className="flex items-center gap-(--lsd-spacing-small)">
            {iconBlobUrl && (
              <Image
                src={iconBlobUrl}
                alt={`${statusMsg?.displayName} icon`}
                width={32}
                height={32}
                className="size-8 object-contain"
              />
            )}
            {statusMsg?.displayName}
          </CardTitle>
          <Badge
            variant={meta.variant}
            size="sm"
            icon={
              <IconComponent
                weight="duotone"
                size={14}
                className={meta.className}
              />
            }
          >
            {t(meta.textKey)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <div className="flex flex-col gap-(--lsd-spacing-smaller) justify-between h-full">
          <Typography
            variant="body1"
            style={{ color: 'var(--lsd-text-secondary)' }}
          >
            {statusMsg?.description || `${t('noStatusMessage')}`}
          </Typography>

          <div className="flex items-center justify-end gap-(--lsd-spacing-smaller) mt-(--lsd-spacing-large)">
            <RecordIcon weight="duotone" className="animate-pulse" />
            <Typography variant="body3">
              {t('lastChecked')} {dayjs(statusMsg.timestamp).fromNow()}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatusOutput() {
  const t = useTranslations('Status');
  const statusMessages = useStore($statusMessages);
  const isLoading = useStore($isLoading);
  const dayjs = useDayjs();
  const [, setTick] = useState(0);

  const isWaitingForHeartbeats = statusMessages.size === 0;

  const serviceCards = useMemo(
    () =>
      Array.from(statusMessages.entries()).map(([service, statusMsg]) => ({
        service,
        statusMsg,
        status: statusMsg?.status as HealthStatus,
        meta: getStatusMeta(statusMsg?.status as HealthStatus),
        iconCid: statusMsg?.iconCid,
      })),
    [statusMessages],
  );

  useEffect(() => {
    if (isWaitingForHeartbeats) return;

    const intervalId = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isWaitingForHeartbeats]);

  return (
    <div className="py-(--lsd-spacing-small)">
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="body1">{t('title')}</Typography>
        <Typography variant="body2" color="secondary">
          {t('subtitle')}
        </Typography>
      </div>

      {isWaitingForHeartbeats ? (
        <div className="flex items-center gap-(--lsd-spacing-small) mt-(--lsd-spacing-small)">
          <Typography variant="body1" color="secondary">
            {isLoading ? t('loading') : t('waitingForHeartbeats')}
          </Typography>
        </div>
      ) : (
        <div className="space-y-(--lsd-spacing-large)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-(--lsd-spacing-base) mt-(--lsd-spacing-small)">
            {serviceCards
              .sort((a, b) =>
                a.statusMsg.displayName.localeCompare(b.statusMsg.displayName),
              )
              .map(({ service, statusMsg }) => (
                <ServiceCard
                  key={service}
                  statusMsg={statusMsg}
                  t={t}
                  dayjs={dayjs}
                />
              ))}
          </div>

          <div
            className="flex flex-col space-y-(--lsd-spacing-smallest)"
            data-prevent-terminal-focus
          >
            <Typography variant="body2" color="secondary">
              {t('healthcheckPrefix')}{' '}
              <Button
                variant="link"
                className="font-bold p-0! h-fit! text-sm!"
                asChild
              >
                <Link
                  href="https://github.com/nipsysdev/dpulse"
                  target="_blank"
                >
                  dpulse
                </Link>
              </Button>
              {t('healthcheckSuffix')}
            </Typography>

            <Typography variant="body2" color="secondary">
              <span className="font-bold">dpulse</span> {t('dpulseSignsPrefix')}{' '}
              <Button
                variant="link"
                className="font-bold p-0! text-sm! h-fit!"
                asChild
              >
                <Link
                  href="https://github.com/logos-messaging/logos-delivery"
                  target="_blank"
                >
                  Logos Delivery
                </Link>
              </Button>
              {t('logosDeliverySuffix')}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}
