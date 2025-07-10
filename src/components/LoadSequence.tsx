'use client';

import { Typography } from '@acid-info/lsd-react/client/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '@/constants/lang';
import { routing } from '@/i18n/intl';

interface BootStep {
  message: string;
  delay: number;
}

export default function LoadSequence() {
  const [currentStep, setCurrentStep] = useState(0);
  const [detectedLocale, setDetectedLocale] = useState<string>('en');
  const router = useRouter();

  // Detect user locale
  useEffect(() => {
    const browserLocale = navigator.language.split('-')[0];
    const supportedLocale = routing.locales.includes(browserLocale as Lang)
      ? browserLocale
      : routing.defaultLocale;
    setDetectedLocale(supportedLocale);
  }, []);

  const steps: BootStep[] = useMemo(
    () => [
      { message: '> Connection initialized', delay: 200 },
      { message: '> Detecting user locale...', delay: 400 },
      { message: `> Selecting proper locale [${detectedLocale}]`, delay: 300 },
      { message: `> Redirecting to /${detectedLocale}`, delay: 500 },
    ],
    [detectedLocale],
  );

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    } else {
      // All steps done, redirect
      router.push(`/${detectedLocale}`);
    }
  }, [currentStep, steps, detectedLocale, router]);

  return (
    <div className="p-8">
      <div className="flex flex-col">
        {steps.slice(0, currentStep).map((step, index) => (
          <Typography key={`step-${index}-${step.message}`} variant="subtitle2">
            {step.message}
          </Typography>
        ))}
        {currentStep < steps.length && (
          <div className="flex items-center">
            <span className="animate-pulse">█</span>
          </div>
        )}
      </div>
    </div>
  );
}
