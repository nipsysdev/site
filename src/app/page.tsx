import { routing } from '@/i18n/intl'
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect(`${routing.defaultLocale}`)
}
