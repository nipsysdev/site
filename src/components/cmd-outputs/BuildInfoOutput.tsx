import type { CommandOutputProps } from '@/types/terminal';

export default function BuildInfoOutput({ t }: CommandOutputProps) {
  const buildTimestamp = process.env.BUILD_TIMESTAMP;
  const ipnsHash = process.env.IPNS_HASH;

  return (
    <div className="text-sm">
      <div className="mb-2">{t('cmds.build-info.title')}</div>
      <div className="space-y-1">
        <div>
          <span>Build Time:</span>{' '}
          {buildTimestamp
            ? new Date(buildTimestamp).toLocaleString()
            : 'Unknown'}
        </div>
        <div>
          <span>IPNS Name:</span> {ipnsHash || 'Not configured'}
        </div>
      </div>
    </div>
  );
}
