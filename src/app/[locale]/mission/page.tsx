import Web3Mission from '@/components/web3-mission/Web3Mission';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export const generateMetadata = async (routeData: RouteData) =>
	await setPageMeta(routeData, 'mission');

export default function MissionPage() {
	return <Web3Mission />;
}
