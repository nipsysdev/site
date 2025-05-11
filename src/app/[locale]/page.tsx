'use client'
import { useTranslations } from 'next-intl'

export default function HomePageEn() {
  const t = useTranslations('Core')
  return <div>{t('sourceCode')}</div>
}
