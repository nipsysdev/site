import { beforeEach, describe, expect, it } from 'vitest';
import { $isDarkMode, setTheme, toggleTheme } from '@/stores/theme-store';

describe('theme-store', () => {
  beforeEach(() => {
    $isDarkMode.set(true);
  });

  describe('toggleTheme', () => {
    beforeEach(() => {
      $isDarkMode.set(true);
    });

    it('toggles from dark to light mode', () => {
      toggleTheme();

      expect($isDarkMode.get()).toBe(false);
    });

    it('toggles from light to dark mode', () => {
      $isDarkMode.set(false);

      toggleTheme();

      expect($isDarkMode.get()).toBe(true);
    });

    it('toggles back and forth correctly', () => {
      toggleTheme();
      expect($isDarkMode.get()).toBe(false);

      toggleTheme();
      expect($isDarkMode.get()).toBe(true);

      toggleTheme();
      expect($isDarkMode.get()).toBe(false);
    });
  });

  describe('setTheme', () => {
    beforeEach(() => {
      $isDarkMode.set(true);
    });

    it('sets dark mode to true', () => {
      $isDarkMode.set(false);

      setTheme(true);

      expect($isDarkMode.get()).toBe(true);
    });

    it('sets dark mode to false', () => {
      setTheme(false);

      expect($isDarkMode.get()).toBe(false);
    });

    it('handles rapid consecutive theme changes', () => {
      setTheme(false);
      expect($isDarkMode.get()).toBe(false);

      setTheme(true);
      expect($isDarkMode.get()).toBe(true);

      setTheme(false);
      setTheme(true);
      setTheme(false);
      expect($isDarkMode.get()).toBe(false);

      toggleTheme();
      expect($isDarkMode.get()).toBe(true);
    });

    it('can be called multiple times', () => {
      setTheme(false);
      expect($isDarkMode.get()).toBe(false);

      setTheme(true);
      expect($isDarkMode.get()).toBe(true);

      setTheme(false);
      expect($isDarkMode.get()).toBe(false);
    });
  });
});
