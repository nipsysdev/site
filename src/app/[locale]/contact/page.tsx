import Contact from '@/components/contact/Contact';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import type { RouteData } from '@/types/routing';
import { Command } from '@/types/terminal';
import { setPageMeta } from '@/utils/metadata-utils';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'contact');

export default async function ContactPage({ params }: ContactPageProps) {
  await params;
  return (
    <>
      <StaticOutput>
        <Contact />
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Contact} />
    </>
  );
}
