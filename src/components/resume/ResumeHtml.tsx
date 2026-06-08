'use client';

import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import { $isDarkMode } from '@/stores/theme-store';

interface ResumeHtmlProps {
  htmlContent: string;
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

export function ResumeHtml({ htmlContent }: ResumeHtmlProps) {
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
    const { style, body, script } = extractContent(htmlContent);

    shadow.innerHTML = '';

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
      const scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.textContent = script;
      shadow.appendChild(scriptEl);
    }

    setInitialized(true);
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
