import { redirect } from 'next/navigation';
import { routing } from '@/i18n/intl';

export default function RootPage() {
	redirect(`${routing.defaultLocale}`);
}
