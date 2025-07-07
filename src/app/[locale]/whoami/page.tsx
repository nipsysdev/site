import AboutMe from '@/components/about-me/AboutMe';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'whoami');

export default function WhoamiPage() {
  return <AboutMe />;
}
