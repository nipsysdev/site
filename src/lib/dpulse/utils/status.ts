import {
  CheckCircleIcon,
  CircleNotchIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react';

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const STATUS_META = {
  healthy: {
    variant: 'success' as const,
    icon: CheckCircleIcon,
    text: 'Healthy',
    className: '',
  },
  degraded: {
    variant: 'warning' as const,
    icon: CircleNotchIcon,
    text: 'Degraded',
    className: 'animate-spin',
  },
  down: {
    variant: 'destructive' as const,
    icon: XCircleIcon,
    text: 'Down',
    className: '',
  },
  unknown: {
    variant: 'outlined' as const,
    icon: WarningIcon,
    text: 'Unknown',
    className: '',
  },
};

export const CONNECTION_META = {
  connected: {
    icon: CheckCircleIcon,
    text: 'Connected',
    className: '',
  },
  connecting: {
    icon: CircleNotchIcon,
    text: 'Connecting...',
    className: 'animate-spin',
  },
  disconnected: {
    icon: XCircleIcon,
    text: 'Disconnected',
    className: '',
  },
};

export function getStatusMeta(status: HealthStatus) {
  return STATUS_META[status];
}

export function getConnectionMeta(status: ConnectionStatus) {
  return CONNECTION_META[status];
}
