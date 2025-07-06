'use client';
import { Button, ButtonGroup } from '@acid-info/lsd-react/components';
import { useLocale, useTranslations } from 'next-intl';
import { PiGithubLogoFill } from 'react-icons/pi';
import { LangLabels } from '@/constants/lang';
import { Link, usePathname } from '@/i18n/intl';
import styles from '@/styles/components.module.css';
import { cx } from '@/utils/helpers';

export default function Header() {
	const pathname = usePathname();
	const locale = useLocale();
	const t = useTranslations('Core');

	return (
		<div className="flex w-full items-center justify-between text-xs tracking-tighter transition-colors sm:text-sm">
			<ButtonGroup>
				{Object.entries(LangLabels).map(([lang, label]) => (
					<Button
						key={lang}
						variant="outlined"
						className={cx(locale === lang && 'underline', styles.smallBtnLink)}
						size="small"
					>
						<Link href={pathname} locale={lang}>
							{label.slice(0, 2)}
						</Link>
					</Button>
				))}
			</ButtonGroup>

			<Button variant="outlined" size="small" className={styles.smallBtnLink}>
				<a
					href="https://github.com/nipsysdev/site"
					rel="noopener"
					target="_blank"
				>
					<PiGithubLogoFill size="1rem" />
				</a>
			</Button>
		</div>
	);
}
