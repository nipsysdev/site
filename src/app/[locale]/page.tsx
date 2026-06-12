import { getTranslations } from 'next-intl/server';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import { Command } from '@/types/terminal';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Welcome' });

  return (
    <>
      <StaticOutput>
        <div>
          <p>
            {t.rich('welcome', {
              name: (name) => name,
            })}
          </p>
          <p>{t('siteIntro1')}</p>
          <p>
            {t.rich('siteIntro2', {
              cmd: () => 'help',
            })}
          </p>
        </div>
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Welcome} />
    </>
  );
}
