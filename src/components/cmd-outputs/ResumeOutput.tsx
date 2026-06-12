'use client';

import { useStore } from '@nanostores/react';
import { Badge, Button, ScrollArea, Typography } from '@nipsys/lsd';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { $isDarkMode } from '@/stores/theme-store';

const RESUME_PATHS = {
  en: {
    pdf: '/resume/Xavier-SALINIERE_resume.EN.pdf',
    html: '/resume/Xavier-SALINIERE_resume.EN.html',
  },
  fr: {
    pdf: '/resume/Xavier-SALINIERE_resume.FR.pdf',
    html: '/resume/Xavier-SALINIERE_resume.FR.html',
  },
};

async function fetchHtml(locale: 'en' | 'fr'): Promise<string> {
  const response = await fetch(RESUME_PATHS[locale].html);
  if (!response.ok) {
    throw new Error(`Failed to fetch resume HTML: ${response.status}`);
  }
  return response.text();
}

function extractContent(html: string): {
  body: string;
  style: string;
  script: string;
} {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = html.match(
    /<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/i,
  );
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  return {
    style: styleMatch?.[1] || '',
    script: scriptMatch?.[1] || '',
    body: bodyMatch?.[1] || '',
  };
}

function ResumeHtml({ htmlContent }: { htmlContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const isDarkMode = useStore($isDarkMode);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!shadowRef.current) {
      shadowRef.current = containerRef.current.attachShadow({ mode: 'open' });
    }
    const shadow = shadowRef.current;

    // Clear previous content before re-rendering
    shadow.innerHTML = '';

    const { style, body, script } = extractContent(htmlContent);

    const hostStyles = `
      :host {
        display: block;
        width: 100%;
        min-height: 100%;
      }
      :host(.dark) {
        --color-background: var(--color-background-dark, #191e23);
        --color-dimmed: var(--color-dimmed-dark, #23282d);
        --color-primary: var(--color-primary-dark, #fbfbfc);
        --color-secondary: var(--color-secondary-dark, #ccd0d4);
        --color-accent: var(--color-accent-dark, #00a0d2);
      }
      :host(.light) {
        --color-background: var(--color-background-light, #ffffff);
        --color-dimmed: var(--color-dimmed-light, #f3f4f5);
        --color-primary: var(--color-primary-light, #191e23);
        --color-secondary: var(--color-secondary-light, #6c7781);
        --color-accent: var(--color-accent-light, #0073aa);
      }
      .resume-wrapper {
        background: var(--color-background);
        padding: 1.5rem;
        min-height: 100%;
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = hostStyles + style;
    shadow.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.className = 'resume-wrapper';
    wrapper.innerHTML = body;
    shadow.appendChild(wrapper);

    if (script) {
      // SECURITY: Only allow trusted scripts from bundled resume HTML assets.
      // The script content comes from our own /public/resume/*.html files,
      // not from user input. This is safe because we control the source.
      const wrappedScript = `
        const originalDefine = customElements.define.bind(customElements);
        customElements.define = (name, constructor, options) => {
          if (!customElements.get(name)) {
            originalDefine(name, constructor, options);
          }
        };
        ${script}
      `;
      const scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.textContent = wrappedScript;
      shadow.appendChild(scriptEl);
    }

    setInitialized(true);

    // Cleanup: Clear shadow root content on unmount to prevent memory leak
    return () => {
      if (shadowRef.current) {
        shadowRef.current.innerHTML = '';
      }
    };
  }, [htmlContent]);

  useEffect(() => {
    if (!containerRef.current || !initialized) return;

    const host = containerRef.current;
    if (isDarkMode) {
      host.classList.add('dark');
      host.classList.remove('light');
    } else {
      host.classList.add('light');
      host.classList.remove('dark');
    }
  }, [isDarkMode, initialized]);

  return <div ref={containerRef} className={isDarkMode ? 'dark' : 'light'} />;
}

export default function ResumeOutput() {
  const locale = useLocale();
  const t = useTranslations('Resume');

  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHtml(locale as 'en' | 'fr')
      .then(setHtml)
      .catch((err) => {
        console.error('Failed to load resume:', err);
        setError('Failed to load resume');
      });
  }, [locale]);

  return (
    <div className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)">
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="h2">{t('title')}</Typography>
        <Typography variant="body2" color="secondary">
          {t('subtitle')}
        </Typography>
      </div>

      <div className="flex items-center gap-(--lsd-spacing-smaller)">
        <Badge variant="outlined" size="sm">
          {t('viewing')} {locale.toUpperCase()} {t('version')}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-(--lsd-spacing-smaller)">
        <Button
          variant="outlined"
          size="sm"
          asChild
          data-prevent-terminal-focus
        >
          <a href={RESUME_PATHS.en.pdf} download>
            {t('downloadEN')}
          </a>
        </Button>
        <Button variant="outlined" size="sm" asChild>
          <a href={RESUME_PATHS.fr.pdf} download data-prevent-terminal-focus>
            {t('downloadFR')}
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        <div
          className="w-full max-w-6xl h-[600px] border border-(--lsd-color-border) rounded-(--lsd-shape-sm) overflow-hidden"
          data-prevent-terminal-focus
        >
          <ScrollArea className="h-full">
            {error ? (
              <div className="p-4 text-center text-(--lsd-color-text-error)">
                {error}
              </div>
            ) : html ? (
              <ResumeHtml htmlContent={html} />
            ) : (
              <div className="p-4 text-center text-(--lsd-color-text-secondary)">
                Loading...
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
