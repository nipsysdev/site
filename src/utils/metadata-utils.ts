import { Routes } from '@/constants/routes'
import { RouteData } from '@/types/routing'
import { getTranslations } from 'next-intl/server'

export const MetadataUtils = {
  setPageMeta: async (routeData: RouteData, page?: keyof typeof Routes) => {
    const { locale } = await routeData.params
    const tMeta = await getTranslations({ locale, namespace: 'Metadata' })

    const baseMeta = {
      title: tMeta('title'),
      description: tMeta('description'),
    }

    if (!page) return baseMeta

    const pageTitle = (await getTranslations({ locale, namespace: 'Pages' }))(
      page,
    )

    return {
      ...baseMeta,
      title: `${pageTitle} @ ${baseMeta.title}`,
    }
  },
}
