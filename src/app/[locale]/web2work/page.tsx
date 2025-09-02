import Web2work from '@/components/web2work/Web2work';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'web2work');

export default function Web3workPage() {
  return <Web2work />;
}
