import { getTranslations } from 'next-intl/server';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import type { RouteData } from '@/types/routing';
import { Command } from '@/types/terminal';
import { setPageMeta } from '@/utils/metadata-utils';

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'services');

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terminal' });

  return (
    <>
      <StaticOutput>
        <div>
          <p>{t('cmds.services.title')}</p>
          <p>{t('cmds.services.description')}</p>
        </div>
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Services} />
    </>
  );
}
