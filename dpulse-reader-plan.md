# dpulse Reader Implementation Plan

**Project:** dpulse Reader (Status Display Frontend)
**Goal:** Test message reception and display from dpulse using Waku
**Approach:** Hardcoded services with status cards showing latest updates
**Date:** 2026-05-10

---

## Overview

Create a web-based frontend that receives status messages from dpulse via Waku and displays them. This is a proof-of-concept to verify:

1. Waku client-side integration works
2. Message reception and parsing works
3. Signature verification works
4. Display logic works

**Scope:**
- Phase 1: PoC — receive one message, verify, display
- Phase 2: Multi-service list with latest status
- Phase 3 (Future): Full UI with real-time updates

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Waku:** @waku/sdk 0.0.37
- **UI:** React + Tailwind CSS (already in site)
- **Protobuf:** protobufjs

---

## Phase 1: Proof of Concept

### Goal
Connect to Waku, receive one message, verify signature, display status.

### Tasks

#### 1.1 Waku Client Setup
- Install @waku/sdk (v0.0.37)
- Install @waku/core (for Protocols import)
- Create `lib/waku/client.ts`
  - Initialize Waku light node
  - Configure `autoStart: true`
  - Use `defaultBootstrap: true`

#### 1.2 Protobuf Schema
- Copy proto file from dpulse: `src/protobuf/schema.proto`
- Generate TypeScript bindings with protobufjs
- Create `lib/protobuf/status.ts`
  - Import generated types
  - Export encode/decode functions

#### 1.3 Signature Verification
- Copy or reuse crypto verification logic from dpulse
- Create `lib/crypto/verify.ts`
  - `verifySignature(message, signature, publicKey)` returns boolean

#### 1.4 Message Reception
- Create `lib/waku/subscriber.ts`
  - Subscribe to `/nipsys/dpulse/1.0.0/*/proto`
  - Decode protobuf payload
  - Verify signature
  - Return parsed status message

#### 1.5 Simple Display
- Create `app/status/page.tsx`
  - Connect Waku client on mount
  - Wait for first message
  - Display: service name, state, timestamp, signature verified status

#### 1.6 Testing
- Use dpulse CLI to send test message
- Verify message appears in browser console/UI
- Confirm signature verification passes

---

## Phase 2: Multiple Services

### Goal
Display list of hardcoded services with their latest status.

### Tasks

#### 2.1 Service Configuration
```typescript
const SERVICES = [
  {
    name: "nipsys-api",
    publicKey: "base64-encoded-public-key",
  },
  {
    name: "nipsys-db",
    publicKey: "base64-encoded-public-key",
  },
  // ...
]
```

#### 2.2 Message Storage
- Simple in-memory Map: `Map<string, StatusMessage>`
- Key: service name
- Value: latest message (by timestamp)
- Update on each received message

#### 2.3 Status Cards UI
- Grid layout (2-3 columns)
- Each card shows:
  - Service name
  - Current state (Operational/Degraded/Down)
  - Last updated timestamp
  - Signature badge (✓ verified)

#### 2.4 State Colors
- Operational: Green
- Degraded: Yellow/Orange
- Down: Red

#### 2.5 Polling Logic (Optional)
- For offline scenarios:
  - Use Waku Store protocol to query historical messages
  - Or: implement simple refresh button

---

## Phase 3: Future Work (Out of Scope)

- Service registration mechanism (add/remove services dynamically)
- Public key distribution via IPFS
- Historical status view (charts/graphs)
- Alert system (notifications on state changes)
- Real-time websocket fallback for local networks
- Multi-environment support (dev/prod staging)

---

## Hardcoded Services (Initial Set)

For PoC testing, use these services (public keys from dpulse repo):

```typescript
// Public keys loaded from dpulse output
const INITIAL_SERVICES = [
  {
    name: "nipsys-api",
    publicKey: "TODO: generate with `dpulse keys generate`",
  },
  {
    name: "nipsys-db",
    publicKey: "TODO: generate with `dpulse keys generate`",
  },
]
```

**Note:** Public keys will be extracted from dpulse-generated key pairs.

---

## Content Topics

Based on dpulse configuration:
- Development: `/nipsys/dpulse/1.0.0/dev/proto`
- Production: `/nipsys/dpulse/1.0.0/prod/proto`

Subscribe to both or wildcard: `/nipsys/dpulse/1.0.0/*/proto`

---

## Directory Structure

```
site/
├── app/
│   └── status/
│       └── page.tsx         # Status dashboard
├── lib/
│   ├── waku/
│   │   ├── client.ts        # Waku node initialization
│   │   └── subscriber.ts    # Message subscription logic
│   ├── protobuf/
│   │   └── status.ts        # Protobuf encode/decode
│   ├── crypto/
│   │   └── verify.ts        # Signature verification
│   └── services.ts          # Service config with public keys
└── proto/
    └── status.proto         # Schema for protobuf generation
```

---

## Dependencies

- `@waku/sdk@^0.0.37`
- `@waku/core@^0.0.40`
- `protobufjs@^7.4.0`
- Web Crypto API (built-in browser)

---

## Success Criteria

### Phase 1
- [ ] Waku client connects successfully
- [ ] Receives at least one status message
- [ ] Signature verification works
- [ ] Message is displayed on page

### Phase 2
- [ ] Multiple services displayed in grid
- [ ] Each service shows latest status
- [ ] UI updates in real-time when new messages arrive
- [ ] Status colors match state

---

## Testing Strategy

### Manual Testing
1. Start dpulse reader frontend (locally)
2. Send status message from dpulse CLI:
   ```bash
   dpulse send --service nipsys-api --state operational --message "All systems go"
   ```
3. Observe message appears in frontend
4. Verify signature badge shows ✓

### Integration Testing (Future)
- Mock Waku responses with static test messages
- Test signature verification with known valid/invalid signatures
- Verify timestamp validation (±24h window)

---

## Deployment

- Deploy with existing site infrastructure (IPFS/IPNS)
- No backend required (client-side only)
- Accessible via: `https://nipsys.eth.limo/status`

---

## Notes

- Waku works in browser same as Node.js
- Client-side builds work fine with @waku/sdk
- Web Crypto API available in all modern browsers
- State management: React hooks (useState, useEffect) sufficient for PoC

**Approach Rationale:**
- Testing message path first before investing in full UI
- Hardcoded services reduce complexity
- Simple display proves core functionality
- Can iterate to full dashboard once verified working
