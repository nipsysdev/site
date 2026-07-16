'use client';

import { useStore } from '@nanostores/react';
import { Typography } from '@nipsys/lsd';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { buildRawUrl, readRepoFile } from '@/lib/repo/fetch';
import { resolvePath } from '@/lib/repo/path';
import { exists, isDir } from '@/lib/repo/vfs';
import { $repoTree } from '@/stores/repo-store';
import { $terminalPromptRef } from '@/stores/terminal-store';
import type { CommandOutputProps } from '@/types/terminal';

type CatState =
  | { status: 'loading' }
  | { status: 'done'; content: string; size?: number }
  | { status: 'binary'; size?: number }
  | { status: 'error'; error: string };

export default function CatOutput({ entry }: CommandOutputProps) {
  const t = useTranslations('Cat');
  const repoState = useStore($repoTree);
  const cwd = entry.cwd ?? '/';
  const filename = entry.args.positional[0];
  const target = useMemo(
    () => (filename ? resolvePath(cwd, filename) : ''),
    [filename, cwd],
  );
  const [state, setState] = useState<CatState>({ status: 'loading' });

  useEffect(() => {
    if (!filename) return;
    let cancelled = false;
    const vfs = repoState.vfs;
    if (!vfs) {
      setState({ status: 'loading' });
      return;
    }
    if (!exists(vfs, target)) {
      setState({
        status: 'error',
        error: `cat: ${filename}: No such file or directory`,
      });
      return;
    }
    if (isDir(vfs, target)) {
      setState({
        status: 'error',
        error: `cat: ${filename}: Is a directory`,
      });
      return;
    }
    setState({ status: 'loading' });
    readRepoFile(target).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        if (result.binary) {
          setState({ status: 'binary', size: result.size });
        } else {
          setState({
            status: 'done',
            content: result.content ?? '',
            size: result.size,
          });
        }
      } else {
        setState({
          status: 'error',
          error: result.error ?? 'cat: read failed',
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filename, repoState.vfs, target]);

  useEffect(() => {
    if (state.status !== 'done' && state.status !== 'binary') return;
    // cat content loads asynchronously, after the submit-time scroll already
    // fired — scroll the freshly-rendered content into view once it appears.
    const id = setTimeout(() => {
      $terminalPromptRef.get()?.current?.scrollIntoView();
    });
    return () => clearTimeout(id);
  }, [state.status]);

  if (!filename) {
    return (
      <Typography variant="body2" color="destructive">
        cat: missing operand
      </Typography>
    );
  }

  if (state.status === 'loading') {
    return (
      <Typography variant="body2" color="secondary">
        {t('loading', { file: filename })}
      </Typography>
    );
  }

  if (state.status === 'error') {
    return (
      <Typography variant="body2" color="destructive">
        {state.error}
      </Typography>
    );
  }

  if (state.status === 'binary') {
    const rawUrl = buildRawUrl(target);
    return (
      <Typography variant="body2" color="secondary">
        cat: {filename}: binary file ({state.size ?? 0} bytes){' '}
        <a href={rawUrl} target="_blank" rel="noreferrer" className="underline">
          view raw
        </a>
      </Typography>
    );
  }

  return (
    <div className="py-(--lsd-spacing-small)">
      <div className="font-mono whitespace-pre-wrap break-words text-(length:--lsd-body2-fontSize)">
        {state.content}
      </div>
    </div>
  );
}
