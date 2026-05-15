import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  decodeStatusMessage,
  validateStatusMessage,
} from '@/lib/dpulse/protobuf/codec';
import {
  ServiceState,
  type StatusMessage,
  StatusMessage as StatusMessageType,
} from '@/lib/dpulse/protobuf/schema';

describe('validateStatusMessage', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createValidMessage = (
    overrides?: Partial<StatusMessage>,
  ): StatusMessage => ({
    serviceName: 'test-service',
    displayName: 'Test Service',
    description: 'A test service for validation',
    status: ServiceState.OPERATIONAL,
    timestamp: Date.now(),
    signature: 'valid-signature-base64',
    ...overrides,
  });

  describe('valid message', () => {
    it('returns true for a valid message with all required fields', () => {
      const message = createValidMessage();

      const result = validateStatusMessage(message);

      expect(result).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns true for DEGRADED status', () => {
      const message = createValidMessage({ status: ServiceState.DEGRADED });

      const result = validateStatusMessage(message);

      expect(result).toBe(true);
    });

    it('returns true for DOWN status', () => {
      const message = createValidMessage({ status: ServiceState.DOWN });

      const result = validateStatusMessage(message);

      expect(result).toBe(true);
    });

    it('returns true when optional icon field is missing', () => {
      const message = createValidMessage();

      const result = validateStatusMessage(message);

      expect(result).toBe(true);
    });
  });

  describe('missing serviceName', () => {
    it('returns false and logs error when serviceName is missing', () => {
      const message = createValidMessage({
        serviceName: undefined as unknown as string,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid serviceName',
      );
    });

    it('returns false when serviceName is empty string', () => {
      const message = createValidMessage({ serviceName: '' });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid serviceName',
      );
    });

    it('returns false when serviceName is not a string', () => {
      const message = createValidMessage({
        serviceName: 123 as unknown as string,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid serviceName',
      );
    });
  });

  describe('missing/empty displayName', () => {
    it('returns false and logs error when displayName is missing', () => {
      const message = createValidMessage({
        displayName: undefined as unknown as string,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid displayName',
      );
    });

    it('returns false when displayName is empty string', () => {
      const message = createValidMessage({ displayName: '' });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid displayName',
      );
    });
  });

  describe('missing description', () => {
    it('returns false and logs error when description is missing', () => {
      const message = createValidMessage({
        description: undefined as unknown as string,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid description',
      );
    });

    it('returns false when description is empty string', () => {
      const message = createValidMessage({ description: '' });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid description',
      );
    });
  });

  describe('invalid status', () => {
    it('returns false and logs error for status value 99', () => {
      const message = createValidMessage({ status: 99 as ServiceState });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: invalid status 99',
      );
    });

    it('returns false for status value 3', () => {
      const message = createValidMessage({ status: 3 as ServiceState });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: invalid status 3',
      );
    });

    it('returns false for negative status value', () => {
      const message = createValidMessage({ status: -1 as ServiceState });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: invalid status -1',
      );
    });

    it('returns false when status is null', () => {
      const message = createValidMessage({
        status: null as unknown as ServiceState,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing status',
      );
    });

    it('returns false when status is undefined', () => {
      const message = createValidMessage({
        status: undefined as unknown as ServiceState,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing status',
      );
    });
  });

  describe('timestamp validation', () => {
    it('returns false and logs error when timestamp is in future (+25 hours)', () => {
      const futureTimestamp = Date.now() + 25 * 60 * 60 * 1000;
      const message = createValidMessage({ timestamp: futureTimestamp });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('StatusMessage validation failed: timestamp'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('is in future'),
      );
    });

    it('returns false when timestamp is too old (-25 hours)', () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const message = createValidMessage({ timestamp: oldTimestamp });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('StatusMessage validation failed: timestamp'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('is too old'),
      );
    });

    it('returns true for timestamp within 1 hour in the past', () => {
      const validPastTimestamp = Date.now() - 30 * 60 * 1000;
      const message = createValidMessage({ timestamp: validPastTimestamp });

      const result = validateStatusMessage(message);

      expect(result).toBe(true);
    });

    it('returns true for timestamp within 1 hour in the future', () => {
      const validFutureTimestamp = Date.now() + 30 * 60 * 1000;
      const message = createValidMessage({ timestamp: validFutureTimestamp });

      const result = validateStatusMessage(message);

      expect(result).toBe(true);
    });

    it('returns false for timestamp 2 hours in the future (outside 1h window)', () => {
      const invalidFutureTimestamp = Date.now() + 2 * 60 * 60 * 1000;
      const message = createValidMessage({ timestamp: invalidFutureTimestamp });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('StatusMessage validation failed: timestamp'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('is in future'),
      );
    });

    it('returns false for timestamp 2 hours in the past (outside 1h window)', () => {
      const invalidPastTimestamp = Date.now() - 2 * 60 * 60 * 1000;
      const message = createValidMessage({ timestamp: invalidPastTimestamp });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('StatusMessage validation failed: timestamp'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('is too old'),
      );
    });

    it('returns false when timestamp is missing', () => {
      const message = createValidMessage({
        timestamp: undefined as unknown as number,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid timestamp',
      );
    });

    it('returns false when timestamp is not a number', () => {
      const message = createValidMessage({
        timestamp: '123456789' as unknown as number,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid timestamp',
      );
    });
  });

  describe('missing signature', () => {
    it('returns false and logs error when signature is missing', () => {
      const message = createValidMessage({
        signature: undefined as unknown as string,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing signature',
      );
    });

    it('returns false when signature is empty string', () => {
      const message = createValidMessage({ signature: '' });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing signature',
      );
    });

    it('returns false when signature is not a string', () => {
      const message = createValidMessage({
        signature: 12345 as unknown as string,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing signature',
      );
    });
  });

  describe('malformed state (type coercion)', () => {
    it('returns false when status is a string instead of number', () => {
      const message = createValidMessage({
        status: 'HEALTHY' as unknown as ServiceState,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('returns false when timestamp is an object', () => {
      const message = createValidMessage({
        timestamp: { value: Date.now() } as unknown as number,
      });

      const result = validateStatusMessage(message);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StatusMessage validation failed: missing or invalid timestamp',
      );
    });
  });

  describe('error message quality', () => {
    it('provides descriptive error for missing serviceName', () => {
      const message = createValidMessage({
        serviceName: undefined as unknown as string,
      });

      validateStatusMessage(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing or invalid serviceName'),
      );
    });

    it('provides descriptive error including the invalid status value', () => {
      const message = createValidMessage({ status: 99 as ServiceState });

      validateStatusMessage(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid status 99'),
      );
    });

    it('provides descriptive error for future timestamp with seconds', () => {
      const futureTimestamp = Date.now() + 25 * 60 * 60 * 1000;
      const message = createValidMessage({ timestamp: futureTimestamp });

      validateStatusMessage(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/is in future \(\+\d+\.?\d*s\)/),
      );
    });

    it('provides descriptive error for old timestamp with seconds', () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const message = createValidMessage({ timestamp: oldTimestamp });

      validateStatusMessage(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/is too old \(\d+\.?\d*s ago\)/),
      );
    });
  });
});

describe('decodeStatusMessage', () => {
  it('decodes a valid protobuf message', () => {
    const originalMessage = {
      serviceName: 'test-service',
      displayName: 'Test Service',
      description: 'A test service',
      status: ServiceState.OPERATIONAL,
      timestamp: Date.now(),
      signature: 'test-sig',
    };

    const encoded = StatusMessageType.encode(
      StatusMessageType.create(originalMessage),
    ).finish();
    const decoded = decodeStatusMessage(encoded);

    expect(decoded.serviceName).toBe(originalMessage.serviceName);
    expect(decoded.displayName).toBe(originalMessage.displayName);
    expect(decoded.description).toBe(originalMessage.description);
    expect(decoded.status).toBe(originalMessage.status);
    expect(decoded.timestamp).toBe(originalMessage.timestamp);
    expect(decoded.signature).toBe(originalMessage.signature);
  });
});
