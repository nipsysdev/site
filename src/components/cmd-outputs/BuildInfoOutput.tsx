import type { CommandOutputProps } from '@/types/terminal';

export default function BuildInfoOutput({ t }: CommandOutputProps) {
  const buildTimestamp = process.env.BUILD_TIMESTAMP;
  const ipnsHash = process.env.IPNS_HASH;

  return (
    <div className="text-sm">
      <div className="mb-2">{t('cmds.build-info.title')}</div>
      <div className="space-y-1">
        <div>
          <span>{t('cmds.build-info.timeLabel')}</span>{' '}
          {buildTimestamp
            ? new Date(buildTimestamp).toLocaleString()
            : t('cmds.build-info.unknown')}
        </div>
        <div>
          <span>{t('cmds.build-info.ipnsLabel')}</span>{' '}
          {ipnsHash || t('cmds.build-info.notConfigured')}
        </div>
      </div>
    </div>
  );
}
