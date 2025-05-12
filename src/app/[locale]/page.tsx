'use client'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('Core')
  return <div>{t('sourceCode')}</div>
}
