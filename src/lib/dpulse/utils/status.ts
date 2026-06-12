import {
  CheckCircleIcon,
  CircleNotchIcon,
  XCircleIcon,
} from '@phosphor-icons/react';

import type { HealthStatus } from '../types';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const STATUS_META = {
  healthy: {
    variant: 'success' as const,
    icon: CheckCircleIcon,
    textKey: 'status.healthy',
    className: '',
  },
  degraded: {
    variant: 'warning' as const,
    icon: CircleNotchIcon,
    textKey: 'status.degraded',
    className: 'animate-spin',
  },
  down: {
    variant: 'destructive' as const,
    icon: XCircleIcon,
    textKey: 'status.down',
    className: '',
  },
};

export const CONNECTION_META = {
  connected: {
    icon: CheckCircleIcon,
    textKey: 'Status.connected',
    className: '',
  },
  connecting: {
    icon: CircleNotchIcon,
    textKey: 'Status.connecting',
    className: 'animate-spin',
  },
  disconnected: {
    icon: XCircleIcon,
    textKey: 'Status.disconnected',
    className: '',
  },
};

export function getStatusMeta(status: HealthStatus) {
  return STATUS_META[status];
}

export function getConnectionMeta(status: ConnectionStatus) {
  return CONNECTION_META[status];
}
