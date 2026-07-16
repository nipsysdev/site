'use client';

import { Typography } from '@nipsys/lsd';
import type { CommandOutputProps } from '@/types/terminal';

export default function PwdOutput({ entry }: CommandOutputProps) {
  return <Typography variant="body2">{entry.cwd ?? '/'}</Typography>;
}
