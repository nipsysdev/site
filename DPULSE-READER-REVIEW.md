# dpulse-reader Review Findings

**Project:** site — dpulse Reader PoC (Status Display Frontend)  
**Branch:** feature/dpulse-reader-poc  
**Commit:** d3196ad  
**Date:** 2026-05-11  
**Review Date:** 2026-05-11

---

## Overview

The dpulse-reader is a web-based frontend that receives status messages from dpulse via Waku and displays them. This proof-of-concept tests browser-side Waku integration, message reception, signature verification, and UI integration.

---

## Critical Issues (Must Fix Before Production)

### 1. Scalar Payload Construction — Ambiguity Attack

**Severity:** 🔴 CRITICAL  
**Location:** `src/lib/dpulse/protobuf/codec.ts` (lines 31-34)

**Issue:**
Messages verified using string concatenation without delimiters between fields.

```typescript
const encoder = new TextEncoder();
const payload =
  message.serviceName +
  message.state.toString() +
  message.timestamp.toString();
const payloadBytes = encoder.encode(payload);
```

**Impact:**
- Ambiguity attacks: `"test" + "1" + "100"` = `"test110"` collides with `"test1" + "0" + "100"`
- Same vulnerability as dpulse (inherited from shared protocol)
- Malicious actors could forge status messages

**Fix:**
```typescript
const encoder = new TextEncoder();
const payload = `${message.serviceName}|${message.state}|${message.timestamp}`;
const payloadBytes = encoder.encode(payload);
```

**Alternative (Binary Serialization):**
```typescript
const payload = Buffer.concat([
  Buffer.from(message.serviceName),
  Buffer.from([message.state]),
  Buffer.from(message.timestamp.toString())
]);
```

**Note:** This fix must be coordinated with dpulse so both sides use the same delimiter format.

---

### 2. Missing Timestamp Validation

**Severity:** 🔴 CRITICAL  
**Location:** `src/lib/dpulse/protobuf/codec.ts` (lines 18-42)

**Issue:**
No timestamp window validation — accepts messages from any time period.

```typescript
export async function decodeAndVerifyStatusMessage(
  bytes: Uint8Array,
  publicKeyPem: string,
): Promise<StatusMessageType | null> {
  const message = decodeStatusMessage(bytes);
  
  // ... decode and verify
  
  const isValid = await verifyMessage(payloadBytes, signature, publicKey);
  return isValid ? message : null;
}
```

**Impact:**
- Old messages from years ago accepted
- Replay attacks possible with old valid signatures
- Clock synchronization issues cause confusing UI states

**Fix:**
```typescript
export async function decodeAndVerifyStatusMessage(
  bytes: Uint8Array,
  publicKeyPem: string,
): Promise<StatusMessageType | null> {
  const message = decodeStatusMessage(bytes);
  
  // Timestamp validation (7-day window for reader)
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (message.timestamp > now + sevenDays) {
    console.warn('Message timestamp too far in future, rejecting');
    return null;
  }
  if (message.timestamp < now - sevenDays) {
    console.warn('Message timestamp too old, rejecting');
    return null;
  }
  
  const isValid = await verifyMessage(payloadBytes, signature, publicKey);
  return isValid ? message : null;
}
```

**Note:** Use longer window (7 days) than dpulse (24h) to handle offline scenarios in browsers.

---

### 3. Content Topic Mismatch

**Severity:** 🔴 CRITICAL  
**Location:** `src/lib/dpulse/config.ts` (line 2)

**Issue:**
Content topic doesn't match dpulse's configured topic.

```typescript
export const DPULSE_CONFIG = {
  contentTopic: '/dpulse/1.0.0/dev/proto',  // ← Wrong
  // dpulse uses: '/nipsys/dpulse/1.0.0/dev/proto'
}
```

**Impact:**
- Subscribing to wrong topic — no messages received
- dpulse and reader cannot communicate

**Fix:**
```typescript
export const DPULSE_CONFIG = {
  contentTopic: '/nipsys/dpulse/1.0.0/dev/proto',  // ← Match dpulse
}
```

---

### 4. Single Hardcoded Public Key for All Messages

**Severity:** 🔴 CRITICAL  
**Location:** `src/stores/dpulseStore.ts` (lines 37-42, 138-141)

**Issue:**
Uses single global public key for verifying all messages.

```typescript
export const $services = atom<ServiceConfig[]>([
  {
    name: 'dpulse',
    publicKey: DPULSE_CONFIG.publicKey,  // ← Single key
  },
]);

// In handleMessage:
const verifiedMessage = await decodeAndVerifyStatusMessage(
  payload,
  DPULSE_CONFIG.publicKey,  // ← Wrong key for multi-service setup
);
```

**Impact:**
- Cannot verify messages from multiple services
- Multi-service monitoring impossible
- Incorrect verification when multiple services share same topic

**Fix:**
```typescript
async function handleMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) return;

    // Decode first to identify service
    const message = decodeStatusMessage(payload);
    if (!message.serviceName) return;

    // Find service config for this service
    const services = $services.get();
    const serviceConfig = services.find(s => s.name === message.serviceName);
    if (!serviceConfig) {
      console.warn(`Unknown service: ${message.serviceName}`);
      return;
    }

    // Verify with correct public key
    const verifiedMessage = await decodeAndVerifyStatusMessage(
      payload,
      serviceConfig.publicKey,  // ← Use service-specific key
    );

    if (!verifiedMessage) {
      console.warn('Failed to verify status message signature');
      return;
    }

    const status = mapServiceStateToStatus(verifiedMessage.state);
    updateStatusMessage({
      service: verifiedMessage.serviceName,
      status,
      message: verifiedMessage.message || '',
      timestamp: verifiedMessage.timestamp,
      metadata: {
        hasSignature: !!verifiedMessage.signature,
      },
    });
  } catch (error) {
    console.error('Error handling dpulse message:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  }
}
```

---

## High Priority Issues

### 5. No Message Deduplication

**Severity:** 🟠 HIGH  
**Location:** `src/stores/dpulseStore.ts` (lines 131-165)

**Issue:**
Same message received multiple times causes redundant UI updates.

```typescript
async function handleMessage(wakuMessage: IDecodedMessage): Promise<void> {
  const verifiedMessage = await decodeAndVerifyStatusMessage(...);
  if (!verifiedMessage) return;

  updateStatusMessage({
    service: verifiedMessage.serviceName,
    status,
    message: verifiedMessage.message || '',
    timestamp: verifiedMessage.timestamp,
    // ... no deduplication check
  });
}
```

**Impact:**
- Redundant UI updates
- Waku Filter/Relay may deliver same message multiple times
- Performance impact with many services

**Fix:**
```typescript
// Add message tracking
const seenMessages = new Set<string>();

async function handleMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const verifiedMessage = await decodeAndVerifyStatusMessage(...);
    if (!verifiedMessage) return;

    // Generate hash for deduplication
    const hash = `${verifiedMessage.serviceName}:${verifiedMessage.timestamp}:${verifiedMessage.signature}`;
    if (seenMessages.has(hash)) {
      console.debug('Duplicate message, ignoring');
      return;
    }
    seenMessages.add(hash);

    // ... process message
  } catch (error) {
    console.error('Error handling dpulse message:', error);
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  for (const hash of seenMessages) {
    const timestamp = parseInt(hash.split(':')[1] || '0');
    if (now - timestamp > oneHour) {
      seenMessages.delete(hash);
    }
  }
}, 60 * 60 * 1000); // Every hour
```

---

### 6. Error Reporting Incomplete

**Severity:** 🟠 HIGH  
**Location:** `src/stores/dpulseStore.ts` (lines 159-164), `src/stores/dpulseStore.ts` (line 237)

**Issue:**
Errors logged to console but not surfaced to user.

```typescript
} catch (error) {
  console.error('Error handling dpulse message:', error);
  setError(
    error instanceof Error ? error.message : 'Unknown error handling message',
  );
}
```

**Impact:**
- Users don't see actionable error details
- Cannot distinguish between network errors, crypto errors, parsing errors
- UI just shows generic "error" state

**Fix:**
```typescript
function mapWakuError(error: unknown): { message: string; action: string } {
  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED')) {
      return {
        message: 'Cannot connect to Waku network',
        action: 'Check your internet connection and try again'
      };
    }
    if (error.message.includes('timeout')) {
      return {
        message: 'Waku connection timed out',
        action: 'Wait a moment and retry, or check if peers are available'
      };
    }
    if (error.message.includes('signature')) {
      return {
        message: 'Message signature verification failed',
        action: 'Message may be from a different service or tampered with'
      };
    }
  }
  return {
    message: 'Unknown error occurred',
    action: 'Check browser console for details'
  };
}

// In handleError:
const { message, action } = mapWakuError(error);
$errorMessage.set(`${message}. ${action}`);
```

---

### 7. No Connection Cleanup on Unmount

**Severity:** 🟠 HIGH  
**Location:** `src/stores/dpulseStore.ts` (entire file), components using `initWaku()`

**Issue:**
Waku node never stopped — connections leak on component unmount.

```typescript
export async function initWaku(): Promise<void> {
  if (wakuNode) {
    console.log('Dpulse subscription already active');
    return;
  }

  const node = await createAndStartNode();
  wakuNode = node;
  // No cleanup function exported
}
```

**Impact:**
- Multiple component mounts create duplicate connections
- Memory leaks
- Network resources not released

**Fix:**
```typescript
export async function stopWaku(): Promise<void> {
  if (!wakuNode) return;

  try {
    await wakuNode.stop();
    wakuNode = null;
    decoder = null;
    clearRetryTimer();
    setConnectionStatus('disconnected');
    console.log('Waku node stopped');
  } catch (error) {
    console.error('Error stopping Waku node:', error);
  }
}

// In component using initWaku:
useEffect(() => {
  initWaku();
  
  return () => {
    stopWaku();  // Cleanup on unmount
  };
}, []);
```

---

### 8. Retry Logic Unbounded

**Severity:** 🟠 HIGH  
**Location:** `src/stores/dpulseStore.ts` (lines 175-189)

**Issue:**
Infinite retry on persistent failure.

```typescript
function scheduleRetry(): void {
  retryCount++;
  console.log(`Scheduling Waku connection retry #${retryCount} in 5 seconds...`);
  $connectionStatus.set('connecting');

  retryTimer = setTimeout(async () => {
    try {
      await attemptConnection();
    } catch (error) {
      console.error(`Retry #${retryCount} failed:`, error);
      scheduleRetry();  // ← Infinite retry
    }
  }, 5000);
}
```

**Impact:**
- Never gives up on persistent failures
- Unnecessary network traffic
- No user feedback for unrecoverable failures

**Fix:**
```typescript
const MAX_RETRIES = 10;

function scheduleRetry(): void {
  if (retryCount >= MAX_RETRIES) {
    console.error('Max retries reached, giving up');
    $connectionStatus.set('disconnected');
    setError('Failed to connect after multiple attempts. Please refresh to retry.');
    return;
  }

  retryCount++;
  const delay = Math.min(5000 * 2 ** (retryCount - 1), 60000); // Max 60s
  
  console.log(`Scheduling Waku connection retry #${retryCount} in ${delay / 1000}s...`);
  $connectionStatus.set('connecting');

  retryTimer = setTimeout(async () => {
    try {
      await attemptConnection();
    } catch (error) {
      console.error(`Retry #${retryCount} failed:`, error);
      scheduleRetry();
    }
  }, delay);
}
```

---

### 9. Dependency Version Mismatch

**Severity:** 🟠 HIGH  
**Location:** `package.json` (line 37)

**Issue:**
```json
{
  "dependencies": {
    "@waku/sdk": "^0.0.36"  // ← Should be ^0.0.37 to match dpulse
  }
}
```

**Impact:**
- Protocol version mismatch with dpulse
- May cause message parsing failures

**Fix:**
```bash
cd /development/site
pnpm add @waku/sdk@^0.0.37
```

---

## Medium Priority Issues

### 10. No Window Focus Handling

**Severity:** 🟡 MEDIUM  
**Location:** `src/stores/dpulseStore.ts`, component mounting

**Issue:**
Waku connection attempts on every component mount, even in background tabs.

**Impact:**
- Multiple browser tabs create duplicate connections
- Unnecessary network traffic
- Performance degradation

**Fix:**
```typescript
// Only connect when tab is focused
let connectionInitiated = false;

export async function initWaku(): Promise<void> {
  if (wakuNode || connectionInitiated) return;
  
  // Check if window is focused
  if (!isTabFocused()) {
    console.log('Tab not focused, skipping Waku init');
    return;
  }

  connectionInitiated = true;
  // ... existing init logic
}

function isTabFocused(): boolean {
  return typeof document !== 'undefined' && document.hasFocus();
}

// Listen for focus events
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    if (!wakuNode && connectionInitiated) {
      // Retry connection when user returns to tab
      initWaku();
    }
  });
}
```

---

### 11. No Service CRUD Operations

**Severity:** 🟡 MEDIUM  
**Location:** `src/stores/dpulseStore.ts` (lines 37-42)

**Issue:**
Services hardcoded in store, no way to add/remove dynamically.

```typescript
export const $services = atom<ServiceConfig[]>([
  {
    name: 'dpulse',
    publicKey: DPULSE_CONFIG.publicKey,
  },
]);
```

**Impact:**
- Cannot monitor additional services without code changes
- No service discovery or registration
- Not production-ready for multi-service monitoring

**Fix:**
```typescript
// Add CRUD operations
export function addService(service: ServiceConfig): void {
  const services = $services.get();
  const exists = services.some(s => s.name === service.name);
  if (exists) {
    throw new Error(`Service "${service.name}" already exists`);
  }
  $services.set([...services, service]);
}

export function removeService(serviceName: string): void {
  const services = $services.get();
  $services.set(services.filter(s => s.name !== serviceName));
  // Also remove status messages
  const messages = $statusMessages.get();
  messages.delete(serviceName);
  $statusMessages.set(messages);
}

export function updateService(serviceName: string, updates: Partial<ServiceConfig>): void {
  const services = $services.get();
  $services.set(services.map(s => 
    s.name === serviceName ? { ...s, ...updates } : s
  ));
}

// In ServicesOutput component:
// Add UI buttons for add/remove services
```

---

### 12. No Historical Message Storage

**Severity:** 🟡 MEDIUM  
**Location:** `src/stores/dpulseStore.ts` (line 36)

**Issue:**
Only latest status message per service stored.

```typescript
export const $statusMessages = atom<Map<string, ServiceStatus>>(new Map());
```

**Impact:**
- Cannot view status history
- No trend analysis
- Cannot debug past state changes

**Fix:**
```typescript
export interface ServiceStatusHistory {
  current: ServiceStatus;
  history: Array<ServiceStatus & { id: string }>;
}

// Store recent history (last 50 messages per service)
const MAX_HISTORY = 50;

export const $statusMessagesHistory = atom<Map<string, ServiceStatusHistory>>(new Map());

export function updateStatusMessage(message: ServiceStatus): void {
  const currentMaps = $statusMessagesHistory.get();
  const serviceHistory = currentMaps.get(message.service) || {
    current: message,
    history: [],
  };

  const newHistory = [
    { ...message, id: generateId() },
    ...serviceHistory.history,
  ].slice(0, MAX_HISTORY);

  currentMaps.set(message.service, {
    current: message,
    history: newHistory,
  });
  $statusMessagesHistory.set(currentMaps);
}
```

---

### 13. Missing Public Key Import Validation

**Severity:** 🟡 MEDIUM  
**Location:** `src/lib/dpulse/crypto/signature.ts` (lines 33-58)

**Issue:**
No validation before importing public key from PEM.

```typescript
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  // No validation of PEM format
```

**Impact:**
- Invalid PEMs cause cryptic errors
- Malformed inputs not caught early

**Fix:**
```typescript
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  // Validate PEM format
  const pemRegex = /^-----BEGIN PUBLIC KEY-----(\n|.)+-----END PUBLIC KEY-----$/;
  if (!pemRegex.test(pem)) {
    throw new Error('Invalid PEM format: must start with "-----BEGIN PUBLIC KEY-----"');
  }

  const pemContents = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  // Validate base64
  try {
    atob(pemContents);
  } catch {
    throw new Error('Invalid PEM: base64 decoding failed');
  }

  // ... existing import logic
}
```

---

### 14. No Offline Indicator

**Severity:** 🟡 MEDIUM  
**Location:** `src/stores/dpulseStore.ts`, UI components

**Issue:**
No distinction between "no messages yet" and "network down".

**Impact:**
- User doesn't know if service is down or reader is disconnected
- Confusing UI states

**Fix:**
```typescript
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'offline';

export const $connectionStatus = atom<ConnectionStatus>('disconnected');
export const $lastMessageTime = atom<number | null>(null);

// Check for network status
function checkLastMessageAge(): void {
  const lastTime = $lastMessageTime.get();
  if (!lastTime) return;

  const age = Date.now() - lastTime;
  if (age > 5 * 60 * 1000) { // 5 minutes
    $connectionStatus.set('offline');
  }
}

// Update last message time on every received message
function handleMessage(wakuMessage: IDecodedMessage): Promise<void> {
  // ... handle message
  $lastMessageTime.set(Date.now());
  $connectionStatus.set('connected');
}

// In ServicesOutput:
{connectionStatus === 'offline' && (
  <Typography variant="body2" className="text-yellow-500">
    No messages received recently. Check network connection.
  </Typography>
)}
```

---

### 15. No Message Persistence

**Severity:** 🟡 MEDIUM  
**Location:** `src/stores/dpulseStore.ts`

**Issue:**
Messages lost on page refresh.

**Impact:**
- User sees blank state on reload
- Cannot resume after browser close
- Poor UX for intermittent connectivity

**Fix:**
```typescript
// Load from localStorage on init
const STORAGE_KEY = 'dpulse_messages';

export function initMessageStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      $statusMessages.set(new Map(Object.entries(messages)));
    }
  } catch (error) {
    console.warn('Failed to load messages from storage:', error);
  }

  // Watch for changes and save
  $statusMessages.subscribe((messages) => {
    try {
      const obj = Object.fromEntries(messages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.warn('Failed to save messages to storage:', error);
    }
  });
}
```

---

## Low Priority Issues

### 16. No Service Health Trending

**Severity:** 🟢 LOW  
**Location:** UI components

**Issue:**
No visual indication of service uptime or reliability.

**Impact:**
- Can't assess Service Level Agreement (SLA) compliance
- No trust in status display

**Fix:**
Add uptime percentage indicator:
```typescript
function calculateUptime(serviceName: string, period: number = 24 * 60 * 60 * 1000): number {
  const history = $statusMessagesHistory.get()?.get(serviceName)?.history || [];
  const now = Date.now();
  const recentMessages = history.filter(m => now - m.timestamp <= period);
  
  if (recentMessages.length === 0) return 0;
  
  const healthyMessages = recentMessages.filter(m => m.status === 'healthy');
  return (healthyMessages.length / recentMessages.length) * 100;
}

// Display as: "Uptime: 99.8% (last 24h)"
```

---

### 17. Limited Loading States

**Severity:** 🟢 LOW  
**Location:** `src/components/cmd-outputs/ServicesOutput.tsx` (lines 87-92)

**Issue:**
Only one generic loading state.

**Impact:**
- User doesn't know if connecting, waiting for messages, or processing

**Fix:**
```typescript
const LoadingState = {
  INITIALIZING: 'Initializing Waku connection...',
  CONNECTING: 'Connecting to network peers...',
  SUBSCRIBING: 'Subscribing to status messages...',
  WAITING: 'Waiting for first message...',
};

{connectionStatus === 'connecting' && (
  <Typography variant="body2">
    {LoadingState[loadingStep]}
  </Typography>
)}
```

---

### 18. No Service Grouping

**Severity:** 🟢 LOW  
**Location:** UI components

**Issue:**
All services displayed in flat list.

**Impact:**
- Hard to organize many services
- No environment separation (dev/prod)

**Fix:**
```typescript
export interface ServiceGroup {
  name: string;
  services: ServiceConfig[];
}

export const $serviceGroups = atom<ServiceGroup[]>([
  { name: 'Core Services', services: [...] },
  { name: 'External APIs', services: [...] },
]);

// Display grouped with collapsible headers
```

---

### 19. No Message Search/Filter

**Severity:** 🟢 LOW  
**Location:** UI components

**Issue:**
Cannot search or filter services by name or status.

**Impact:**
- Hard to find specific service in large deployments
- No quick view of "only down services"

**Fix:**
```typescript
export const $filterQuery = atom('');

// In ServicesOutput:
const filteredServices = services.filter(s =>
  s.name.toLowerCase().includes($filterQuery.get().toLowerCase()) ||
  (statusMessages.get(s.service)?.status === 'down')
);
```

---

## Testing Considerations

### Unit Tests Needed
- [ ] Protobuf encode/decode
- [ ] Signature verification
- [ ] Public key import with edge cases
- [ ] Timestamp validation
- [ ] Message deduplication
- [ ] Error mapping

### Integration Tests Needed
- [ ] Waku mock for browser testing
- [ ] End-to-end message flow
- [ ] UI state updates on message receipt
- [ ] Connection failure handling
- [ ] Retry logic

### Manual Testing Checklist
- [ ] Connect to Waku network
- [ ] Receive and verify message
- [ ] Display status card
- [ ] Handle disconnection
- [ ] Reconnect after page refresh
- [ ] Multiple messages update correctly
- [ ] Invalid messages rejected

---

## Immediate Action Plan

1. **Fix Payload Delimiters** (Critical #1)
   ```typescript
   const payload = `${serviceName}|${state}|${timestamp}`;
   ```

2. **Add Timestamp Validation** (Critical #2)
   ```typescript
   // Add 7-day window check
   ```

3. **Align Content Topic** (Critical #3)
   ```typescript
   contentTopic: '/nipsys/dpulse/1.0.0/dev/proto'
   ```

4. **Implement Per-Service Verification** (Critical #4)
   ```typescript
   // Match service name to config, use correct public key
   ```

5. **Add Message Deduplication** (High #5)
   ```typescript
   // Track message hashes with Set
   ```

6. **Improve Error Reporting** (High #6)
   ```typescript
   // Map Waku errors to user-friendly messages
   ```

7. **Add Connection Cleanup** (High #7)
   ```typescript
   // Export stopWaku() and use in useEffect cleanup
   ```

8. **Bound Retry Logic** (High #8)
   ```typescript
   // Max 10 retries before giving up
   ```

9. **Update Dependency** (High #9)
   ```bash
   pnpm add @waku/sdk@^0.0.37
   ```

---

## Production Readiness Checklist

- [x] Browser-compatible Waku integration
- [x] Protobuf schema definition
- [x] Signature verification (Web Crypto)
- [x] React/nanostores integration
- [x] Loading states
- [x] Basic error handling
- [ ] Payload delimiters (issue #1)
- [ ] Timestamp validation (issue #2)
- [ ] Content topic alignment (issue #3)
- [ ] Per-service key verification (issue #4)
- [ ] Message deduplication (issue #5)
- [ ] User-friendly error messages (issue #6)
- [ ] Connection cleanup (issue #7)
- [ ] Bounded retry logic (issue #8)
- [ ] Dependency version alignment (issue #9)
- [ ] Window focus handling (issue #10)
- [ ] Service CRUD operations (issue #11)
- [ ] Historical message storage (issue #12)
- [ ] Offline indicator (issue #14)
- [ ] Message persistence (issue #15)

---

## Summary

**Overall Assessment:** B (82/100)

The dpulse-reader demonstrates solid browser-side Waku integration with correct Filter protocol usage, proper Web Crypto API implementation, and clean React/nanostores integration. The foundation is strong, but the prototype has several critical issues inherited from the shared protocol design (payload construction) and missing production features (deduplication, validation).

**What Works Well:**
- Waku browser integration (Filter protocol, light node setup)
- Correct protobuf decoding and encoding
- Web Crypto API signature verification
- Clean React component structure with @nipsys/lsd
- Well-organized state management with nanostores
- Connection retry with exponential backoff

**Must Fix Before Production:**
1. Payload delimiters (collaborate with dpulse for consistent format)
2. Timestamp validation (7-day window for browser)
3. Content topic alignment
4. Per-service public key verification
5. Message deduplication
6. User-friendly error reporting
7. Connection cleanup on unmount
8. Bounded retry logic

**Recommendation:** Fix critical issues first, then add production features (service CRUD, historical storage). The prototype is ready to evolve into a full-featured status dashboard once core issues are resolved.

**Next Steps:**
1. Coordinate with dpulse to fix payload format (delimiters) — both projects must update together
2. Add remaining critical fixes
3. Implement high-priority improvements
4. Add tests for message flow and verification
5. Deploy to staging for real-world Waku network testing

---

**Reviewed by:** Echo (CT-1409)  
**Date:** 2026-05-11
