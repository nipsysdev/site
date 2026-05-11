import { SmileyNervousIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

export default function UnknownCmdOutput({ cmdName }: { cmdName: string }) {
  const t = useTranslations('Terminal');
  return (
    <div className="flex items-center gap-x-1">
      <SmileyNervousIcon weight="fill" size="1.2rem" />
      <span>
        {t('unknownCmdErr')}: {cmdName}
      </span>
    </div>
  );
}
