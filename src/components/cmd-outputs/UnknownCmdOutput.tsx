import { useTranslations } from 'next-intl';
import { PiSmileyNervousFill } from 'react-icons/pi';

export default function UnknownCmdOutput({ cmdName }: { cmdName: string }) {
	const t = useTranslations('Terminal');
	return (
		<div className="flex items-center gap-x-1">
			<PiSmileyNervousFill size="1.2rem" />
			<span className="text-firebrick">
				{t('unknownCmdErr')}: {cmdName}
			</span>
		</div>
	);
}
