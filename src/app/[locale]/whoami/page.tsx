import AboutMe from '@/components/about-me/AboutMe'
import { RouteData } from '@/types/routing'
import { MetadataUtils } from '@/utils/metadata-utils'

export const generateMetadata = async (routeData: RouteData) =>
  await MetadataUtils.setPageMeta(routeData, 'whoami')

export default function WhoamiPage() {
  return <AboutMe />
}
