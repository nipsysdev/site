'use client';

import { Badge, Button, Typography } from '@nipsys/lsd';
import {
  ButterflyIcon,
  ChatTeardropTextIcon,
  CopyIcon,
  EnvelopeIcon,
  GithubLogoIcon,
  type IconWeight,
  LinkedinLogoIcon,
  PaperPlaneTiltIcon,
  TwitterLogoIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

// Base64 encoded email to prevent scraping (decoded after hydration)
// Generate with: btoa("your@email.com")
const ENCODED_EMAIL = 'Ym9uam91ckB4YXZpZXJzLnNo';

interface ContactLink {
  icon: React.ComponentType<{ weight?: IconWeight; size?: number }>;
  labelKey: string;
  href: string;
  displayText: string;
  copyable?: boolean;
}

export default function Contact() {
  const t = useTranslations('Contact');
  const [email, setEmail] = useState<string | null>(null);
  const { copyWithToast, isCopied } = useCopyToClipboard();

  useEffect(() => {
    setEmail(atob(ENCODED_EMAIL));
  }, []);

  const socialLinks: ContactLink[] = [
    {
      icon: GithubLogoIcon,
      labelKey: 'github',
      href: 'https://github.com/nipsysdev',
      displayText: 'nipsysdev',
    },
    {
      icon: TwitterLogoIcon,
      labelKey: 'twitter',
      href: 'https://x.com/nipsysdev',
      displayText: '@nipsysdev',
    },
    {
      icon: PaperPlaneTiltIcon,
      labelKey: 'telegram',
      href: 'https://t.me/nipsysdev',
      displayText: '@nipsysdev',
    },
    {
      icon: ButterflyIcon,
      labelKey: 'bluesky',
      href: 'https://bsky.app/profile/nipsys.bsky.social',
      displayText: '@nipsys.bsky.social',
    },
    {
      icon: LinkedinLogoIcon,
      labelKey: 'linkedin',
      href: 'https://linkedin.com/in/xaviersaliniere',
      displayText: 'xaviersaliniere',
    },
  ];

  const directLinks: ContactLink[] = [
    {
      icon: ChatTeardropTextIcon,
      labelKey: 'matrix',
      href: 'https://matrix.to/#/@nipsys:nips.im',
      displayText: '@nipsys:nips.im',
      copyable: true,
    },
    {
      icon: EnvelopeIcon,
      labelKey: 'email',
      href: email ? `mailto:${email}` : '#',
      displayText: email ?? '...',
      copyable: true,
    },
  ];

  const renderLink = ({
    icon: Icon,
    labelKey,
    href,
    displayText,
    copyable,
  }: ContactLink) => {
    return (
      <div key={labelKey} className="contents">
        <Badge
          variant="outlined"
          size="sm"
          className="shrink-0 leading-1"
          icon={<Icon weight="duotone" size={14} />}
        >
          {t(`links.${labelKey}`)}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-auto py-1 px-2 justify-start"
        >
          <a
            href={href}
            target={labelKey === 'email' ? undefined : '_blank'}
            rel={labelKey === 'email' ? undefined : 'noopener noreferrer'}
            className="justify-start!"
          >
            <Typography variant="body3">{displayText}</Typography>
          </a>
        </Button>

        {copyable ? (
          <Button
            variant="ghost"
            size="square-sm"
            onClick={() => copyWithToast(displayText, t('copyToast'), labelKey)}
            aria-label={t('copyLabel')}
          >
            <CopyIcon
              weight={isCopied(labelKey) ? 'fill' : 'duotone'}
              size={14}
            />
          </Button>
        ) : (
          <div />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)">
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="body1">{t('title')}</Typography>
        <Typography variant="body2" color="secondary">
          {t('subtitle')}
        </Typography>
      </div>

      <div className="grid grid-cols-[auto_auto_auto] w-fit items-center gap-x-(--lsd-spacing-base) gap-y-(--lsd-spacing-smallest)">
        {/* Social Section */}
        <Typography
          variant="body2"
          color="secondary"
          className="col-span-3 mb-(--lsd-spacing-smaller)"
        >
          {t('socialSection')}
        </Typography>
        {socialLinks.map((link) => renderLink(link))}

        {/* Direct Contact Section */}
        <Typography
          variant="body2"
          color="secondary"
          className="col-span-3 mt-(--lsd-spacing-smaller) mb-(--lsd-spacing-smaller)"
        >
          {t('directSection')}
        </Typography>
        {directLinks.map((link) => renderLink(link))}
      </div>
    </div>
  );
}
