import type { KeyboardEvent } from 'react';
import { describe, expect, it } from 'vitest';
import type { AppRoute } from '@/types/routing';
import { ViewRoute } from '@/types/routing';
import { isNewKeyEvent, isNewRouteEvent } from '@/utils/compare-utils';

describe('compare-utils', () => {
  describe('isNewRouteEvent', () => {
    it('should return true when newEvent exists and oldEvent is null', () => {
      const newEvent: AppRoute = {
        viewRoute: ViewRoute.Terminal,
        timeStamp: 123456,
      };
      expect(isNewRouteEvent(null, newEvent)).toBe(true);
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
  });

  describe('isNewKeyEvent', () => {
    const createKeyboardEvent = (
      key: string,
      timeStamp: number,
    ): KeyboardEvent =>
      ({
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
      }) as KeyboardEvent;

    it('should return true when newEvent exists and oldEvent is null', () => {
      const newEvent = createKeyboardEvent('Enter', 123456);
      expect(isNewKeyEvent(null, newEvent)).toBe(true);
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
  });
});
