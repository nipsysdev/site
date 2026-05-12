'use client';

import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useState } from 'react';
import { $isDarkMode } from '@/stores/theme-store';

interface LoadSequenceProps {
  children?: React.ReactNode;
}

export default function LoadSequence({ children }: LoadSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isDarkMode = useStore($isDarkMode);

  useEffect(() => {
    document.body.style.visibility = 'visible';
  }, []);

  const steps = useMemo(
    () => [
      { message: '> Detecting theme preference...', delay: 600 },
      {
        message: `> Theme set to [${isDarkMode ? 'dark' : 'light'}]`,
        delay: 200,
      },
      {
        message: '> Initializing application...',
        delay: 200,
      },
    ],
    [isDarkMode],
  );

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [currentStep, steps]);

  const fadeInAnimation =
    'opacity-0 animate-[showInstant_0s_ease-in-out_forwards]';
  const stepHeight = 'h-[24px] leading-6';

  if (!isLoading && children) {
    return <>{children}</>;
  }

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
          <span>{'> Connected to IPFS'}</span>
        </div>
        <div
          className={`top-[24px] ${currentStep ? '' : fadeInAnimation} h-0`}
          style={{ animationDelay: '600ms' }}
        >
          <span>{'> Loading core chunks'}</span>
        </div>

        <div className="flex flex-col mt-[24px]">
          {steps.slice(0, currentStep).map((step) => (
            <div className={stepHeight} key={step.message}>
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
