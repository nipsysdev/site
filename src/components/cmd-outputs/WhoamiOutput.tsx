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

export default function WhoamiOutput() {
  const tAbout = useTranslations('AboutMe');
  const { copyWithToast, isCopied } = useCopyToClipboard();

  const quickInfo = [
    { icon: MapPinIcon, textKey: 'badges.location' },
    { icon: BriefcaseIcon, textKey: 'badges.experience' },
    { icon: LockKeyIcon, textKey: 'badges.focus' },
    { icon: TargetIcon, textKey: 'badges.goal' },
  ];

  return (
    <div
      className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)"
      data-prevent-terminal-focus
    >
      <div className="flex gap-(--lsd-spacing-large) items-center">
        <Avatar className="size-32!">
          <AvatarImage src={profileImage.src} alt="Xav" />
          <AvatarFallback>X</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-(--lsd-spacing-base)">
          <div className="flex flex-col gap-(--lsd-spacing-smallest)">
            <Typography variant="h2">{tAbout('name')}</Typography>
            <Typography variant="body2" color="secondary">
              {tAbout('tagline')}
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
                {tAbout(textKey)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        <Typography variant="body1">{tAbout('bio.intro1')}</Typography>
        <Typography variant="body1">{tAbout('bio.intro2')}</Typography>

        <Typography variant="body2" color="secondary">
          {tAbout('bio.para1')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {tAbout('bio.para2')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {tAbout('bio.para3')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {tAbout('bio.para4')}
        </Typography>

        <Typography variant="body2" color="secondary">
          {tAbout('bio.para5')}
        </Typography>

        <Typography variant="body2">{tAbout('bio.current')}</Typography>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <div className="flex items-center gap-(--lsd-spacing-smaller)">
          <Typography variant="label1" color="secondary">
            {tAbout('gpgLabel')}
          </Typography>
          <Button
            variant="ghost"
            size="square-sm"
            onClick={() => copyWithToast(GPG_FINGERPRINT, tAbout('copyToast'))}
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
