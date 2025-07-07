import { describe, it, expect } from 'vitest';
import { Lang, LangLabels } from '@/constants/lang';

describe('lang', () => {
  describe('Lang enum', () => {
    it('should have En and Fr values', () => {
      expect(Lang.En).toBe('en');
      expect(Lang.Fr).toBe('fr');
    });

    it('should have exactly 2 language options', () => {
      const langValues = Object.values(Lang);
      expect(langValues).toHaveLength(2);
    });

    it('should have string values', () => {
      Object.values(Lang).forEach(lang => {
        expect(typeof lang).toBe('string');
      });
    });
  });

  describe('LangLabels', () => {
    it('should have labels for all languages', () => {
      expect(LangLabels[Lang.En]).toBe('English');
      expect(LangLabels[Lang.Fr]).toBe('Français');
    });

    it('should have labels for all Lang enum values', () => {
      Object.values(Lang).forEach(lang => {
        expect(LangLabels[lang]).toBeDefined();
        expect(typeof LangLabels[lang]).toBe('string');
        expect(LangLabels[lang].length).toBeGreaterThan(0);
      });
    });

    it('should not have extra labels', () => {
      const langKeys = Object.keys(LangLabels);
      const enumValues = Object.values(Lang);
      
      expect(langKeys).toHaveLength(enumValues.length);
      
      langKeys.forEach(key => {
        expect(enumValues).toContain(key as Lang);
      });
    });

    it('should have proper label formatting', () => {
      expect(LangLabels[Lang.En]).toMatch(/^[A-Z][a-z]+$/);
      expect(LangLabels[Lang.Fr]).toMatch(/^[A-ZÀ-ÿ][a-zà-ÿ]+$/);
    });
  });

  describe('Lang and LangLabels consistency', () => {
    it('should have matching keys between Lang enum and LangLabels', () => {
      const enumValues = Object.values(Lang);
      const labelKeys = Object.keys(LangLabels);
      
      enumValues.forEach(lang => {
        expect(labelKeys).toContain(lang);
      });
      
      labelKeys.forEach(key => {
        expect(enumValues).toContain(key as Lang);
      });
    });
  });
});
