import GalleryOutput from '@/components/cmd-outputs/GalleryOutput';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import type { RouteData } from '@/types/routing';
import { Command } from '@/types/terminal';
import { setPageMeta } from '@/utils/metadata-utils';

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData, 'gallery');

export default async function GalleryPage({ params }: GalleryPageProps) {
  await params;
  return (
    <>
      <StaticOutput>
        <GalleryOutput />
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Gallery} />
    </>
  );
}
