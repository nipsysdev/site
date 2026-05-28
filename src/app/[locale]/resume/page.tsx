import Resume from '@/components/resume/Resume';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import type { RouteData } from '@/types/routing';
import { Command } from '@/types/terminal';
import { setPageMeta } from '@/utils/metadata-utils';

interface ResumePageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'resume');

export default async function ResumePage({ params }: ResumePageProps) {
  await params;
  return (
    <>
      <StaticOutput>
        <Resume />
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Resume} />
    </>
  );
}
