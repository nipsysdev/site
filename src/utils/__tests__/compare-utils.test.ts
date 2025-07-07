import { describe, it, expect } from 'vitest';
import type { KeyboardEvent } from 'react';
import { isNewRouteEvent, isNewKeyEvent } from '@/utils/compare-utils';
import type { AppRoute } from '@/types/routing';
import { ViewRoute } from '@/types/routing';

describe('compare-utils', () => {
  describe('isNewRouteEvent', () => {
    it('should return true when newEvent exists and oldEvent is null', () => {
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(null, newEvent)).toBe(true);
    });

    it('should return true when newEvent exists and oldEvent is undefined', () => {
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(undefined, newEvent)).toBe(true);
    });

    it('should return false when newEvent is null', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, null)).toBe(false);
    });

    it('should return false when newEvent is undefined', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, undefined)).toBe(false);
    });

    it('should return true when viewRoute is different', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Whoami,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should return true when param is different', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 'param1',
        timeStamp: 123456,
      };
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 'param2',
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should return true when timeStamp is different', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 789012,
      };
      expect(isNewRouteEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should return false when events are identical', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 'param1',
        timeStamp: 123456,
      };
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 'param1',
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, newEvent)).toBe(false);
    });

    it('should handle undefined params correctly', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 'param1',
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should handle numeric params', () => {
      const oldEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 1,
        timeStamp: 123456,
      };
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        param: 2,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(oldEvent, newEvent)).toBe(true);
    });
  });

  describe('isNewKeyEvent', () => {
    const createKeyboardEvent = (key: string, timeStamp: number): KeyboardEvent => ({
      key,
      timeStamp,
      // Add minimal required properties for KeyboardEvent
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
      type: 'keydown',
      bubbles: true,
      cancelable: true,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as KeyboardEvent);

    it('should return true when newEvent exists and oldEvent is null', () => {
      const newEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(null, newEvent)).toBe(true);
    });

    it('should return true when newEvent exists and oldEvent is undefined', () => {
      const newEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(undefined, newEvent)).toBe(true);
    });

    it('should return false when newEvent is null', () => {
      const oldEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(oldEvent, null)).toBe(false);
    });

    it('should return false when newEvent is undefined', () => {
      const oldEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(oldEvent, undefined)).toBe(false);
    });

    it('should return true when key is different', () => {
      const oldEvent = createKeyboardEvent('Enter', 123456);
      const newEvent = createKeyboardEvent('Escape', 123456);
      expect(isNewKeyEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should return true when timeStamp is different', () => {
      const oldEvent = createKeyboardEvent('Enter', 123456);
      const newEvent = createKeyboardEvent('Enter', 789012);
      expect(isNewKeyEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should return false when events are identical', () => {
      const oldEvent = createKeyboardEvent('Enter', 123456);
      const newEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(oldEvent, newEvent)).toBe(false);
    });

    it('should handle special keys', () => {
      const oldEvent = createKeyboardEvent('ArrowUp', 123456);
      const newEvent = createKeyboardEvent('ArrowDown', 123456);
      expect(isNewKeyEvent(oldEvent, newEvent)).toBe(true);
    });

    it('should handle space key', () => {
      const oldEvent = createKeyboardEvent(' ', 123456);
      const newEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(oldEvent, newEvent)).toBe(true);
    });
  });
});
