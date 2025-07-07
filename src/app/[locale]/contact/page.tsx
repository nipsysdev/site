import Contact from '@/components/contact/Contact';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'contact');

export default function ContactPage() {
  return <Contact />;
}
