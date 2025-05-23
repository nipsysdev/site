import Contact from '@/components/contact/Contact'
import { RouteData } from '@/types/routing'
import { MetadataUtils } from '@/utils/metadata-utils'

export const generateMetadata = async (routeData: RouteData) =>
  await MetadataUtils.setPageMeta(routeData, 'contact')

export default function ContactPage() {
  return <Contact />
}
