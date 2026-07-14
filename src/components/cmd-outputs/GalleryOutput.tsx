'use client';

import { useStore } from '@nanostores/react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Typography,
} from '@nipsys/lsd';
import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ImagesIcon,
} from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useDayjs } from '@/hooks/useDayjs';
import type { Translator } from '@/i18n/intl';
import type { FeedEntry } from '@/lib/dpulse/protobuf/feed-schema';
import {
  $connectionStatus,
  $error,
  $feedEntries,
  $isLoading,
} from '@/lib/dpulse/stores';

export default function GalleryOutput() {
  const t = useTranslations('Gallery');
  const entries = useStore($feedEntries);
  const isLoading = useStore($isLoading);
  const error = useStore($error);
  const connectionStatus = useStore($connectionStatus);
  const isWaitingForFeed =
    connectionStatus === 'connected' && entries.length === 0;

  return (
    <div className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)">
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="body1">{t('title')}</Typography>
        <Typography variant="body2" color="secondary">
          {t('subtitle')}
        </Typography>
      </div>

      {isLoading && entries.length === 0 ? (
        <Typography variant="body1" color="secondary">
          {t('loading')}
        </Typography>
      ) : error ? (
        <Typography variant="body1" color="destructive">
          {error}
        </Typography>
      ) : isWaitingForFeed ? (
        <Typography variant="body1" color="secondary">
          {t('waitingForFeed')}
        </Typography>
      ) : entries.length === 0 ? (
        <Typography variant="body1" color="secondary">
          {t('notFound')}
        </Typography>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-(--lsd-spacing-base)">
            {entries.map((entry) => (
              <PostCard key={entry.id} entry={entry} t={t} />
            ))}
          </div>
          <div
            className="flex flex-col space-y-(--lsd-spacing-smallest)"
            data-prevent-terminal-focus
          >
            <Typography variant="body2" color="secondary">
              {t('feedPrefix')}{' '}
              <Button
                variant="link"
                className="font-bold p-0! h-fit! text-sm!"
                asChild
              >
                <Link
                  href="https://github.com/nipsysdev/dpulse"
                  target="_blank"
                >
                  dpulse
                </Link>
              </Button>
              {t('feedSuffix')}
            </Typography>

            <Typography variant="body2" color="secondary">
              <span className="font-bold">dpulse</span> {t('dpulseSignsPrefix')}{' '}
              <Button
                variant="link"
                className="font-bold p-0! text-sm! h-fit!"
                asChild
              >
                <Link
                  href="https://github.com/logos-messaging/logos-delivery"
                  target="_blank"
                >
                  Logos Delivery
                </Link>
              </Button>
              {t('logosDeliverySuffix')}
            </Typography>
          </div>
        </>
      )}
    </div>
  );
}

function PostCard({ entry, t }: { entry: FeedEntry; t: Translator }) {
  const dayjs = useDayjs();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasMultipleImages = entry.images.length > 1;

  const longDate = entry.published ? dayjs(entry.published).format('LL') : '';
  const shortDate = entry.published ? dayjs(entry.published).format('L') : '';

  const handlePreviousImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? entry.images.length - 1 : prev - 1,
    );
  }, [entry.images.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === entry.images.length - 1 ? 0 : prev + 1,
    );
  }, [entry.images.length]);

  useEffect(() => {
    if (!isDialogOpen || !hasMultipleImages) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, hasMultipleImages, handlePreviousImage, handleNextImage]);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setCurrentImageIndex(0);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Card
          className="cursor-pointer hover:ring-1 hover:ring-(--lsd-border) transition-all"
          data-prevent-terminal-focus
        >
          <CardContent className="p-0">
            {entry.images.length > 0 && (
              <div className="relative">
                <Image
                  src={entry.images[0].url}
                  alt={entry.title}
                  width={400}
                  height={400}
                  unoptimized
                  className="object-cover aspect-square w-full"
                />
                {hasMultipleImages && (
                  <Badge
                    variant="filled"
                    size="sm"
                    className="absolute top-(--lsd-spacing-smaller) right-(--lsd-spacing-smaller) flex items-center gap-(--lsd-spacing-smaller)"
                  >
                    <div className="flex gap-x-(--lsd-spacing-smallest)">
                      <ImagesIcon weight="duotone" size={14} />
                      {entry.images.length}
                    </div>
                  </Badge>
                )}
              </div>
            )}
            <div className="flex flex-col gap-(--lsd-spacing-smaller) p-(--lsd-spacing-base)">
              <Typography variant="body2" className="line-clamp-2">
                {entry.title || entry.content || 'Untitled'}
              </Typography>
              <div className="flex items-center justify-between">
                <Badge variant="outlined" size="sm">
                  {shortDate}
                </Badge>
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--lsd-text-secondary) hover:text-(--lsd-text-primary) transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowSquareOutIcon weight="duotone" size={18} />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="w-6xl! max-w-[80vw]!">
        <div className="flex items-start justify-between gap-(--lsd-spacing-base)">
          <DialogTitle className="sr-only">
            {entry.title || 'Post details'}
          </DialogTitle>
        </div>
        {entry.images.length > 0 && (
          <div className="relative flex items-center justify-center">
            <Image
              src={entry.images[currentImageIndex].url}
              alt={`${entry.title} - Image ${currentImageIndex + 1}`}
              width={800}
              height={800}
              unoptimized
              className="object-contain max-h-[70vh] w-auto h-auto rounded-sm"
            />
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost-rounded"
                  size="square-md"
                  onClick={handlePreviousImage}
                  className="absolute left-(--lsd-spacing-smaller) bg-(--lsd-primary-content)!"
                  aria-label={t('previousImage')}
                >
                  <CaretLeftIcon weight="bold" size={24} />
                </Button>
                <Button
                  variant="ghost-rounded"
                  size="square-md"
                  onClick={handleNextImage}
                  className="absolute right-(--lsd-spacing-smaller) bg-(--lsd-primary-content)!"
                  aria-label={t('nextImage')}
                >
                  <CaretRightIcon weight="bold" size={24} />
                </Button>
                <div className="absolute bottom-(--lsd-spacing-smaller) flex items-center gap-(--lsd-spacing-smaller)">
                  <Badge variant="filled" size="sm">
                    {currentImageIndex + 1} / {entry.images.length}
                  </Badge>
                </div>
              </>
            )}
          </div>
        )}
        <div className="flex flex-col gap-(--lsd-spacing-small) pt-(--lsd-spacing-base)">
          <Typography variant="body1">
            {entry.title || entry.content || 'Untitled'}
          </Typography>
          <div className="flex items-center justify-between">
            <Badge variant="outlined">{longDate}</Badge>
            <a
              href={entry.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-(--lsd-spacing-smaller) text-(--lsd-text-secondary) hover:text-(--lsd-text-primary) transition-colors"
            >
              <Typography variant="body2">{t('viewOnPixelfed')}</Typography>
              <ArrowSquareOutIcon weight="duotone" size={16} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
