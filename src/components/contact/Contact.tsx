'use client';

import { Badge, Button, Typography } from '@nipsys/lsd';
import {
  TwitterLogoIcon,
  LinkedinLogoIcon,
  GithubLogoIcon,
  EnvelopeIcon,
  ChatTeardropTextIcon,
  ButterflyIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContactLink {
  icon: React.ComponentType<{ weight?: string; size?: number }>;
  labelKey: string;
  href: string;
  displayText: string;
  copyable?: boolean;
}

export default function Contact() {
  const t = useTranslations('Contact');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const contactLinks: ContactLink[] = [
    {
      icon: GithubLogoIcon,
      labelKey: 'github',
      href: 'https://github.com/nipsysdev',
      displayText: 'github.com/nipsysdev',
    },
    {
      icon: TwitterLogoIcon,
      labelKey: 'twitter',
      href: 'https://x.com/nipsysdev',
      displayText: '@nipsysdev',
    },
    {
      icon: LinkedinLogoIcon,
      labelKey: 'linkedin',
      href: 'https://linkedin.com/in/xavsaliniere',
      displayText: 'linkedin.com/in/xavsaliniere',
    },
    {
      icon: ButterflyIcon,
      labelKey: 'bluesky',
      href: 'https://bsky.app/profile/nipsysdev.bsky.social',
      displayText: '@nipsysdev.bsky.social',
    },
    {
      icon: ChatTeardropTextIcon,
      labelKey: 'matrix',
      href: 'https://matrix.to/#/@xav:nips.im',
      displayText: '@xav:nips.im',
      copyable: true,
    },
    {
      icon: EnvelopeIcon,
      labelKey: 'email',
      href: 'mailto:xav@example.com',
      displayText: 'xav@example.com',
      copyable: true,
    },
  ];

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(t('copyToast'));
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)">
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="h2">{t('title')}</Typography>
        <Typography variant="body2" color="secondary">
          {t('subtitle')}
        </Typography>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        {contactLinks.map(
          ({ icon: Icon, labelKey, href, displayText, copyable }) => (
            <div
              key={labelKey}
              className="flex items-center gap-(--lsd-spacing-base)"
            >
              <div className="flex items-center gap-(--lsd-spacing-smaller) min-w-0 flex-1">
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
                  className="h-auto py-1 px-2"
                >
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-left"
                  >
                    <Typography variant="body3">{displayText}</Typography>
                  </a>
                </Button>
              </div>

              {copyable && (
                <Button
                  variant="ghost"
                  size="square-sm"
                  onClick={() => handleCopy(displayText, labelKey)}
                  aria-label={t('copyLabel')}
                >
                  <EnvelopeIcon
                    weight={copiedKey === labelKey ? 'fill' : 'duotone'}
                    size={14}
                  />
                </Button>
              )}
            </div>
          )
        )}
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="body2" color="secondary">
          {t('note')}
        </Typography>
      </div>
    </div>
  );
}
