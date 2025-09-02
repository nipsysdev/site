import { describe, expect, it } from 'vitest';
import { cx } from '@/utils/helpers';

describe('helpers', () => {
  describe('cx', () => {
    it('should join string arguments with spaces', () => {
      expect(cx('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out non-string values', () => {
      expect(cx('class1', null, undefined, 'class2', false, 'class3')).toBe(
        'class1 class2 class3',
      );
    });
  });
});
