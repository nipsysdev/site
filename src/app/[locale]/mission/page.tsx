import Web3Mission from '@/components/web3-mission/Web3Mission'
import { RouteData } from '@/types/routing'
import { MetadataUtils } from '@/utils/metadata-utils'

export const generateMetadata = async (routeData: RouteData) =>
  await MetadataUtils.setPageMeta(routeData, 'mission')

export default function MissionPage() {
  return <Web3Mission />
}
