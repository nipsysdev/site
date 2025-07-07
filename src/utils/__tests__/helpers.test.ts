import { describe, it, expect } from 'vitest';
import { cx } from '@/utils/helpers';

describe('helpers', () => {
  describe('cx', () => {
    it('should join string arguments with spaces', () => {
      expect(cx('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out non-string values', () => {
      expect(cx('class1', null, undefined, 'class2', false, 'class3')).toBe('class1 class2 class3');
    });

    it('should handle numbers by filtering them out', () => {
      expect(cx('class1', 123, 'class2')).toBe('class1 class2');
    });

    it('should handle arrays by flattening them', () => {
      expect(cx(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('should handle nested arrays', () => {
      // Only one level of flattening, nested arrays are filtered out (not strings)
      expect(cx(['class1', ['class2', 'class3']], 'class4')).toBe('class1 class4');
    });

    it('should trim the result', () => {
      // Only trims outer whitespace, not between words
      expect(cx(' class1 ', ' class2 ')).toBe('class1   class2');
    });

    it('should return empty string for no valid classes', () => {
      expect(cx(null, undefined, false, 123)).toBe('');
    });

    it('should handle empty arrays', () => {
      expect(cx([], 'class1')).toBe('class1');
    });

    it('should handle mixed nested structures', () => {
      // Nested arrays are filtered out since they're not strings
      expect(cx(['class1', null, ['class2', undefined, 'class3']], false, 'class4')).toBe('class1 class4');
    });

    it('should handle empty strings', () => {
      // Empty strings are included in the join, creating extra spaces
      expect(cx('', 'class1', '', 'class2')).toBe('class1  class2');
    });

    it('should handle whitespace-only strings', () => {
      // Whitespace-only strings are included in the join
      expect(cx('   ', 'class1', '  ', 'class2')).toBe('class1    class2');
    });
  });
});
