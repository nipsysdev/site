'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '@/constants/lang';
import { routing } from '@/i18n/intl';

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

  // React continues from step 3 onward (first 2 are static HTML)
  const steps = useMemo(
    () => [
      { message: '> Detecting user locale...', delay: 800 }, // Start after static HTML finishes
      { message: `> Selecting proper locale [${detectedLocale}]`, delay: 200 },
      {
        message: `> Loading application chunks for /${detectedLocale}`,
        delay: 200,
      },
    ],
    [detectedLocale],
  );

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  // Separate effect for redirect to avoid dependency issues
  useEffect(() => {
    if (currentStep >= steps.length) {
      router.push(`/${detectedLocale}`);
    }
  }, [currentStep, steps.length, detectedLocale, router]);

  // Shared styling constants
  const fadeInAnimation =
    'opacity-0 animate-[showInstant_0s_ease-in-out_forwards]';
  const stepHeight = 'h-[24px] leading-6'; // line-height: 24px to match height

  return (
    <div className="p-8 text-sm font-medium leading-5">
      <style>{`
        @keyframes showInstant {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div className="flex flex-col pt-[24px] relative">
        {/* Static HTML steps that display immediately */}
        <div
          className={`top-0 absolute ${fadeInAnimation}`}
          style={{ animationDelay: '200ms' }}
        >
          <span>&gt; Connected to IPFS</span>
        </div>
        <div
          className={`top-[24px] ${fadeInAnimation} h-0`}
          style={{ animationDelay: '600ms' }}
        >
          <span>&gt; Loading core chunks</span>
        </div>

        <div className="flex flex-col mt-[24px]">
          {steps.slice(0, currentStep).map((step, index) => (
            <div className={stepHeight} key={`step-${index}-${step.message}`}>
              {step.message}
            </div>
          ))}
        </div>
        <div
          className={`${fadeInAnimation}`}
          style={{ animationDelay: '600ms' }}
        >
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}
