import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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

async function getResumeHtml() {
  const publicDir = join(process.cwd(), 'public', 'resume');
  const [htmlEn, htmlFr] = await Promise.all([
    readFile(join(publicDir, 'Xavier-SALINIERE_resume.EN.html'), 'utf-8').catch(
      () => '',
    ),
    readFile(join(publicDir, 'Xavier-SALINIERE_resume.FR.html'), 'utf-8').catch(
      () => '',
    ),
  ]);
  return { htmlEn, htmlFr };
}

export default async function ResumePage({ params }: ResumePageProps) {
  await params;
  const { htmlEn, htmlFr } = await getResumeHtml();

  return (
    <>
      <StaticOutput>
        <Resume htmlEn={htmlEn} htmlFr={htmlFr} />
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Resume} />
    </>
  );
}
