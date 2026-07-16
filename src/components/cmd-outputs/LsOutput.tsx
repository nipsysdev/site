'use client';

import { useStore } from '@nanostores/react';
import { Typography } from '@nipsys/lsd';
import { useTranslations } from 'next-intl';
import { basename, resolvePath } from '@/lib/repo/path';
import type { RepoEntry } from '@/lib/repo/types';
import { exists, isDir, listDir } from '@/lib/repo/vfs';
import { $repoTree } from '@/stores/repo-store';
import type { CommandOutputProps } from '@/types/terminal';

export default function LsOutput({ entry }: CommandOutputProps) {
  const t = useTranslations('Ls');
  const repoState = useStore($repoTree);
  const cwd = entry.cwd ?? '/';
  const positional0 = entry.args.positional[0];
  const flags = entry.args.flags;

  if (repoState.loading && !repoState.vfs) {
    return (
      <Typography variant="body2" color="secondary">
        {t('loading')}
      </Typography>
    );
  }

  const vfs = repoState.vfs;
  if (!vfs) {
    return (
      <Typography variant="body2" color="destructive">
        ls: filesystem unavailable
      </Typography>
    );
  }

  const target = positional0 ? resolvePath(cwd, positional0) : cwd;

  if (!exists(vfs, target)) {
    return (
      <Typography variant="body2" color="destructive">
        ls: cannot access '{positional0}': No such file or directory
      </Typography>
    );
  }

  if (!isDir(vfs, target)) {
    return <Typography variant="body2">{basename(target)}</Typography>;
  }

  const showAll = flags.includes('a') || flags.includes('A');
  const longFormat = flags.includes('l');

  const children = (listDir(vfs, target) ?? []).filter((child) => {
    const name = basename(`/${child.path}`);
    return showAll || !name.startsWith('.');
  });

  const sizeLabel = (child: RepoEntry): string => {
    if (child.type === 'tree') return '-';
    return String(child.size ?? 0);
  };

  if (longFormat) {
    return (
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        {children.map((child) => {
          const name = basename(`/${child.path}`);
          const isDirChild = child.type === 'tree';
          return (
            <div
              key={child.path}
              className="flex gap-(--lsd-spacing-small) items-baseline"
            >
              <span className="inline-block w-14 text-right tabular-nums">
                {sizeLabel(child)}
              </span>
              <span className={isDirChild ? 'font-bold' : undefined}>
                {name}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-(--lsd-spacing-small) gap-y-(--lsd-spacing-smallest)">
      {children.map((child) => {
        const name = basename(`/${child.path}`);
        const isDirChild = child.type === 'tree';
        return (
          <span
            key={child.path}
            className={isDirChild ? 'font-bold' : undefined}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
