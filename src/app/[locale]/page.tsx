import { getTranslations } from 'next-intl/server';
import StaticOutput from '@/components/StaticOutput';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import { Command } from '@/types/terminal';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terminal' });

  return (
    <>
      <StaticOutput>
        <div>
          <p>
            {t.rich('cmds.welcome.welcome', {
              name: (name) => name,
            })}
          </p>
          <p>{t('cmds.welcome.site_intro_1')}</p>
          <p>
            {t.rich('cmds.welcome.site_intro_2', {
              cmd: () => 'help',
            })}
          </p>
        </div>
      </StaticOutput>
      <TerminalEmulator initialCommand={Command.Welcome} />
    </>
  );
}
