import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTerminalContext } from '@/contexts/TerminalContext';
import useTermRouter from '@/hooks/useTermRouter';
import type { AppRoute } from '@/types/routing';
import { ViewRoute } from '@/types/routing';

// Mock the TerminalContext
vi.mock('@/contexts/TerminalContext', () => ({
  useTerminalContext: vi.fn(),
}));

const mockUseTerminalContext = useTerminalContext as ReturnType<typeof vi.fn>;

describe('useTermRouter', () => {
  const mockSetOldRouteReq = vi.fn();
  const mockHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not call handler when no route request', () => {
    mockUseTerminalContext.mockReturnValue({
      lastRouteReq: null,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldRouteReq).not.toHaveBeenCalled();
  });

  it('should not call handler when route does not match listened route', () => {
    const lastRouteReq: AppRoute = {
      viewRoute: ViewRoute.Whoami,
      timeStamp: Date.now(),
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldRouteReq).not.toHaveBeenCalled();
  });

  it('should call handler when new matching route event occurs', () => {
    const lastRouteReq: AppRoute = {
      viewRoute: ViewRoute.Terminal,
      timeStamp: Date.now(),
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq,
      oldRouteReq: null,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(lastRouteReq);
    expect(mockSetOldRouteReq).toHaveBeenCalledWith(lastRouteReq);
  });

  it('should not call handler when route event is not new', () => {
    const sameRouteReq: AppRoute = {
      viewRoute: ViewRoute.Terminal,
      timeStamp: 12345,
    };

    mockUseTerminalContext.mockReturnValue({
      lastRouteReq: sameRouteReq,
      oldRouteReq: sameRouteReq,
      setOldRouteReq: mockSetOldRouteReq,
    });

    renderHook(() => useTermRouter(ViewRoute.Terminal, mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldRouteReq).not.toHaveBeenCalled();
  });
});
