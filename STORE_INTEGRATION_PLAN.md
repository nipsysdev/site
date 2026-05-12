# Site Store Integration Plan

**Goal:** Query Store for most recent heartbeat from the last hour, render initial state, then subscribe to Filter for live updates.

---

## Changes

### 1. Remove `@waku/core` dependency

**File:** `package.json`

Not used anywhere. `Protocols` and `PageDirection` are available in `@waku/sdk` v0.0.36.

---

### 2. Add Store protocol imports

**File:** `src/stores/dpulseStore.ts`

```typescript
import { 
  createLightNode, 
  Protocols, 
  WakuEvent, 
  HealthStatus,
  PageDirection 
} from "@waku/sdk";
```

---

### 3. Add Store query function

**File:** `src/stores/dpulseStore.ts`

```typescript
async function queryStoreHistory(
  node: LightNode, 
  contentTopic: string
): Promise<Map<string, ServiceStatus>> {
  const decoder = node.createDecoder({ contentTopic });
  const messages = new Map<string, ServiceStatus>();
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);
  
  try {
    await node.waitForPeers([Protocols.Store], 15000);
    
    await node.store.queryWithOrderedCallback([decoder], (wakuMessage) => {
      try {
        const status = decodeAndVerifyStatusMessage(wakuMessage.payload);
        if (status && status.timestamp >= oneHourAgo.getTime()) {
          // Keep only most recent per service
          const existing = messages.get(status.serviceName);
          if (!existing || status.timestamp > existing.timestamp) {
            messages.set(status.serviceName, status);
          }
        }
      } catch (error) {
        console.warn("[dpulse] Failed to decode store message:", error);
      }
      // Continue querying all pages
      return false;
    }, {
      pageDirection: PageDirection.BACKWARD,
      timeFilter: {
        startTime: oneHourAgo,
        endTime: now,
      }
    });
  } catch (error) {
    console.warn("[dpulse] Store query failed:", error);
  }
  
  return messages;
}
```

---

### 4. Update initialization sequence

**File:** `src/stores/dpulseStore.ts`

**Current flow:**
```
createAndStartNode()
  → waitForPeers([Protocols.Filter])
  → setupSubscription()
```

**New flow:**
```
createAndStartNode()
  → waitForPeers([Protocols.Store, Protocols.Filter], 20000)
  → queryStoreHistory() → populate $statusMessages
  → setupSubscription() → live updates
```

```typescript
export async function createAndStartNode(): Promise<LightNode> {
  $connectionStatus.set("connecting");
  $isLoading.set(true);
  
  const node = await createLightNode({ 
    defaultBootstrap: true, 
    autoStart: true 
  });
  
  // Wait for both Store and Filter (combined, 20s timeout)
  try {
    await node.waitForPeers([Protocols.Store, Protocols.Filter], 20000);
  } catch (error) {
    console.warn("[dpulse] Peer wait timeout:", error);
  }
  
  // Query Store for initial state
  try {
    const history = await queryStoreHistory(node, DPULSE_CONFIG.contentTopic);
    if (history.size > 0) {
      $statusMessages.set(history);
      console.log(`[dpulse] Loaded ${history.size} services from Store`);
    }
    $connectionStatus.set("connected");
  } catch (error) {
    console.warn("[dpulse] Store query failed, starting fresh:", error);
    $connectionStatus.set("partial");
  }
  
  $isLoading.set(false);
  
  // Subscribe to Filter for live updates
  await setupSubscription(node);
  
  return node;
}
```

---

### 5. No changes to subscription handler

**File:** `src/stores/dpulseStore.ts`

Existing `handleMessage` already updates `$statusMessages`. Live updates from Filter will overwrite stale Store data with newer heartbeats automatically.

---

## Summary

| File | Change |
|------|--------|
| `package.json` | Remove `@waku/core` |
| `src/stores/dpulseStore.ts` | Add `PageDirection` import |
| `src/stores/dpulseStore.ts` | Add `queryStoreHistory()` function |
| `src/stores/dpulseStore.ts` | Update `createAndStartNode()` — Store + Filter wait, query Store first |

**Effort:** ~1-2 hours

---

## Error Handling

- All errors logged to console only (`console.warn`)
- No UI error states for Store failures
- If Store query fails, site starts with empty state and waits for Filter updates
- Connection status: `connected` (Store success), `partial` (Store fail, Filter only)

---

## Verification

1. Open site with no recent heartbeats → Empty state (expected)
2. Send heartbeat via `dpulse send --service test --state operational "Test"`
3. Refresh site → Should show service status immediately (from Store)
4. Send another heartbeat → Should update in real-time (from Filter)
5. Check console for `[dpulse]` logs

---

## Notes

- Store query returns most recent heartbeat per service (deduped by `serviceName`)
- Time filter: last 1 hour (`startTime: now - 3600000`)
- Combined peer wait: 20s timeout for both Store and Filter
- Store query timeout: 15s (internal to `waitForPeers`)
