import Web3work from '@/components/web3work/Web3work';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'web3work');

export default function Web3workPage() {
  return <Web3work />;
}
