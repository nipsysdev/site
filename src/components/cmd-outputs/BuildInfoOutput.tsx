import { useTranslations } from 'next-intl';

export default function BuildInfoOutput() {
  const t = useTranslations('BuildInfo');
  const buildTimestamp = process.env.BUILD_TIMESTAMP;
  const ipnsHash = process.env.IPNS_HASH;

  return (
    <div className="text-sm">
      <div className="mb-2">{t('title')}</div>
      <div className="space-y-1">
        <div>
          <span>{t('timeLabel')}</span>{' '}
          {buildTimestamp
            ? new Date(buildTimestamp).toLocaleString()
            : t('unknown')}
        </div>
        <div>
          <span>{t('ipnsLabel')}</span> {ipnsHash || t('notConfigured')}
        </div>
      </div>
    </div>
  );
}
