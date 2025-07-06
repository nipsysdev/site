import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Routes } from "@/constants/routes";
import type { RouteData } from "@/types/routing";

export async function setPageMeta(
  routeData: RouteData,
  page?: keyof typeof Routes
): Promise<Metadata> {
  const { locale } = await routeData.params;
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });

  const baseMeta = {
    title: tMeta("title"),
    description: tMeta("description"),
  };

  if (!page) return baseMeta;

  const pageTitle = (await getTranslations({ locale, namespace: "Pages" }))(
    page
  );

  return {
    ...baseMeta,
    title: `${pageTitle} @ ${baseMeta.title}`,
  };
}
