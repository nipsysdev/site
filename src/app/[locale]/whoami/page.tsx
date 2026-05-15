import AboutMe from '@/components/about-me/AboutMe';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import type { RouteData } from '@/types/routing';
import { Command } from '@/types/terminal';
import { setPageMeta } from '@/utils/metadata-utils';

interface WhoamiPageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'whoami');

export default async function WhoamiPage({ params }: WhoamiPageProps) {
  await params;
  return (
    <>
      <StaticOutput>
        <AboutMe />
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Whoami} />
    </>
  );
}
