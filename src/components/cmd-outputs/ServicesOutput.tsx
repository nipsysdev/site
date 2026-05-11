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
import { SpinnerIcon } from '@phosphor-icons/react';
import type { HealthStatus } from '@/lib/dpulse/utils/status';
import { getStatusMeta } from '@/lib/dpulse/utils/status';
import { $isLoading, $services, $statusMessages } from '@/stores/dpulseStore';
import type { CommandOutputProps } from '@/types/terminal';

export default function ServicesOutput({ t }: CommandOutputProps) {
  const statusMessages = useStore($statusMessages);
  const isLoading = useStore($isLoading);
  const services = useStore($services);

  return (
    <div>
      <Typography variant="h5" className="mb-(--lsd-spacing-base) font-bold">
        {t('cmds.services.title')}
      </Typography>

      {services.length > 0 ? (
        <div className="grid grid-cols-4 gap-(--lsd-spacing-base)">
          {services.map((service) => {
            const statusMsg = statusMessages.get(service.name);
            const status = (statusMsg?.status || 'unknown') as HealthStatus;
            const meta = getStatusMeta(status);
            const IconComponent = meta.icon;

            return (
              <Card key={service.name}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-(--lsd-spacing-small)">
                    <CardTitle>{service.name}</CardTitle>
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
          })}
        </div>
      ) : (
        <Typography
          variant="body1"
          style={{ color: 'var(--lsd-text-secondary)' }}
          className="mt-(--lsd-spacing-base)"
        >
          {t('cmds.services.noServices')}
        </Typography>
      )}

      {isLoading && statusMessages.size === 0 && (
        <div className="flex items-center gap-(--lsd-spacing-small) mt-(--lsd-spacing-base)">
          <SpinnerIcon weight="duotone" size={20} className="animate-spin" />
          <Typography variant="body1">{t('cmds.services.loading')}</Typography>
        </div>
      )}
    </div>
  );
}
