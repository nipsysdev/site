import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import dayjs from '@/lib/dayjs';

export function useDayjs() {
  const locale = useLocale();

  return useMemo(() => {
    return (date?: dayjs.ConfigType) => {
      return dayjs(date).locale(locale);
    };
  }, [locale]);
}
