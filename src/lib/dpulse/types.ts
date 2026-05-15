export type HealthStatus = 'healthy' | 'degraded' | 'down';

export type { ConnectionStatus } from './utils/status';

export interface ServiceStatus {
  serviceName: string;
  displayName: string;
  description: string;
  status: HealthStatus;
  timestamp: number;
  iconCid?: string;
  metadata: {
    source: 'store' | 'filter';
    signature: string;
  };
}
