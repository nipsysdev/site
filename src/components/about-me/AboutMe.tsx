'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Typography,
} from '@nipsys/lsd';
import {
  BriefcaseIcon,
  CopyIcon,
  LockKeyIcon,
  MapPinIcon,
  TargetIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import gpgFingerprint from '@/assets/gpg-fingerprint.json';
import profileImage from '@/assets/Pro-Hacked.webp';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const GPG_FINGERPRINT = gpgFingerprint.fingerprint;

export default function AboutMe() {
  const t = useTranslations('AboutMe');
  const { copyWithToast, isCopied } = useCopyToClipboard();

  const quickInfo = [
    { icon: MapPinIcon, textKey: 'badges.location' },
    { icon: BriefcaseIcon, textKey: 'badges.experience' },
    { icon: LockKeyIcon, textKey: 'badges.focus' },
    { icon: TargetIcon, textKey: 'badges.goal' },
  ];

  return (
    <div className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)">
      <div className="flex gap-(--lsd-spacing-large) items-center">
        <Avatar className="size-32!">
          <AvatarImage src={profileImage.src} alt="Xav" />
          <AvatarFallback>X</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-(--lsd-spacing-base)">
          <div className="flex flex-col gap-(--lsd-spacing-smallest)">
            <Typography variant="h2">{t('name')}</Typography>
            <Typography variant="body2" color="secondary">
              {t('tagline')}
            </Typography>
          </div>

          <div className="flex flex-wrap gap-(--lsd-spacing-smaller)">
            {quickInfo.map(({ icon: Icon, textKey }) => (
              <Badge
                key={textKey}
                variant="outlined"
                size="sm"
                className="leading-1"
                icon={<Icon weight="duotone" size={14} />}
              >
                {t(textKey)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        <Typography variant="body1">{t('bio.intro1')}</Typography>
        <Typography variant="body1">{t('bio.intro2')}</Typography>

        <Typography variant="body2" color="secondary">
          {t('bio.para1')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {t('bio.para2')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {t('bio.para3')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {t('bio.para4')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {t('bio.para5')}
        </Typography>

        <Typography variant="body2">{t('bio.current')}</Typography>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <div className="flex items-center gap-(--lsd-spacing-smaller)">
          <Typography variant="label1" color="secondary">
            {t('gpgLabel')}
          </Typography>
          <Button
            variant="ghost"
            size="square-sm"
            onClick={() => copyWithToast(GPG_FINGERPRINT, t('copyToast'))}
          >
            <CopyIcon weight={isCopied() ? 'fill' : 'duotone'} size={14} />
          </Button>
        </div>
        <Typography variant="body3" color="secondary">
          {GPG_FINGERPRINT}
        </Typography>
      </div>
    </div>
  );
}
