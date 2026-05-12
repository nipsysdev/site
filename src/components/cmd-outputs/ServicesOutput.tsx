'use client';

import { useStore } from '@nanostores/react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Typography,
} from '@nipsys/lsd';
import { $isLoading, $statusMessages } from '@/lib/dpulse/stores';
import type { HealthStatus } from '@/lib/dpulse/utils/status';
import { getStatusMeta } from '@/lib/dpulse/utils/status';
import type { CommandOutputProps } from '@/types/terminal';

export default function ServicesOutput({ t }: CommandOutputProps) {
  const statusMessages = useStore($statusMessages);
  const isLoading = useStore($isLoading);

  const isWaitingForHeartbeats = statusMessages.size === 0;

  return (
    <div>
      <Typography variant="body2">{t('cmds.services.title')}</Typography>

      {isWaitingForHeartbeats ? (
        <div className="flex items-center gap-(--lsd-spacing-small) mt-(--lsd-spacing-small)">
          <Typography variant="body1" color="secondary">
            {isLoading
              ? t('cmds.services.loading')
              : t('cmds.services.waitingForHeartbeats')}
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-(--lsd-spacing-base) mt-(--lsd-spacing-small)">
          {Array.from(statusMessages.entries()).map(
            ([serviceName, statusMsg]) => {
              const status = (statusMsg?.status || 'unknown') as HealthStatus;
              const meta = getStatusMeta(status);
              const IconComponent = meta.icon;

              return (
                <Card key={serviceName}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-(--lsd-spacing-small)">
                      <CardTitle>{serviceName}</CardTitle>
                      <Badge
                        variant={meta.variant}
                        icon={
                          <IconComponent
                            weight="duotone"
                            size={14}
                            className={meta.className}
                          />
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-(--lsd-spacing-smaller)">
                      <Typography
                        variant="body1"
                        style={{ color: 'var(--lsd-text-secondary)' }}
                      >
                        {statusMsg?.message ||
                          `${t('cmds.services.noStatusMessage')}`}
                      </Typography>
                      {statusMsg?.timestamp && (
                        <Typography variant="body2">
                          {t('cmds.services.lastUpdated')}:{' '}
                          {new Date(statusMsg.timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
