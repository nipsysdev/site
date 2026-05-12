export type { ConnectionStatus, HealthStatus } from './utils/status';

export interface ServiceStatus {
  service: string;
  status: import('./utils/status').HealthStatus;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
