import Contribs from '@/components/contribs/Contribs';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'contribs');

export default function ContribsPage() {
  return <Contribs />;
}
