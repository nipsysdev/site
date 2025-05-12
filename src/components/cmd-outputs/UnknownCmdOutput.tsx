import { useTranslations } from 'next-intl'

export default function UnknownCmdOutput({ cmdName }: { cmdName: string }) {
  const t = useTranslations('Terminal')
  return (
    <span className="text-firebrick">
      {t('unknownCmdErr')}: {cmdName}
    </span>
  )
}
