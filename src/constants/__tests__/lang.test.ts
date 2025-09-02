import { describe, expect, it } from 'vitest';
import { Lang, LangLabels } from '@/constants/lang';

describe('lang', () => {
  describe('Lang enum', () => {
    it('should have En and Fr values', () => {
      expect(Lang.En).toBe('en');
      expect(Lang.Fr).toBe('fr');
    });
  });

  describe('LangLabels', () => {
    it('should have labels for all languages', () => {
      expect(LangLabels[Lang.En]).toBe('English');
      expect(LangLabels[Lang.Fr]).toBe('Français');
    });
  });
});
