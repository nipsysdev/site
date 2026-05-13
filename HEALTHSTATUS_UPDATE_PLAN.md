# HealthStatus Payload Update Plan

## Overview

Update site frontend to handle the new HealthStatus payload format from dpulse, including `displayName`, `description`, and custom SVG icons.

## Current State

- Payload: Protobuf `StatusMessage` with `serviceName`, `state` (enum), `timestamp`, `message`
- Internal Type: `ServiceStatus` with `service`, `status`, `message`, `timestamp`, `metadata`
- UI: Card displays `service` as title, `message` as subtitle, Phosphor icons from `STATUS_META`
- Processing: `message-processor.ts` maps `ServiceState` enum → `HealthStatus` string

## Target State

- Payload: JSON `HealthStatus` with `name`, `displayName`, `description`, `status`, `timestamp`, `icon`
- Internal Type: `ServiceStatus` with `name`, `displayName`, `description`, `status`, `timestamp`, `icon`
- UI: Card displays `displayName` as title, `description` as subtitle, custom SVG icons (with fallback)
- Processing: Direct mapping, ISO timestamp parsing

---

## Implementation Steps

### 1. Update Types (`src/lib/dpulse/types.ts`)

```typescript
export interface ServiceStatus {
  name: string;              // identifier (was 'service')
  displayName: string;       // NEW: UI label
  description: string;       // NEW: secondary info (was 'message')
  status: HealthStatus;      // unchanged
  timestamp: number;         // parsed from ISO string
  icon?: string;             // NEW: raw SVG
  metadata?: {
    source: 'store' | 'filter';
    hasSignature?: boolean;  // keep if signatures still used
  };
}
```

### 2. Decision: Protobuf vs JSON

**Option A: Keep Protobuf**
- Add fields to `protobuf/schema.ts`:
  ```typescript
  .add(new protobuf.Field('displayName', 7, 'string'))
  .add(new protobuf.Field('description', 8, 'string'))
  .add(new protobuf.Field('icon', 9, 'string', 'optional'))
  ```
- Update `protobuf/codec.ts` decode function

**Option B: Switch to JSON**
- Delete `protobuf/schema.ts`, `protobuf/codec.ts`
- Create `src/lib/dpulse/json/decoder.ts` for JSON parsing
- Simpler, matches dpulse change

**Recommendation:** Coordinate with dpulse. If dpulse switches to JSON, follow here.

### 3. Create SVG Sanitizer (`src/lib/dpulse/utils/svg-sanitize.ts`)

**CRITICAL SECURITY**: Raw SVG from Waku could contain XSS.

```typescript
/**
 * Sanitize SVG string to prevent XSS attacks.
 * Removes script tags, event handlers, and external resources.
 */
export function sanitizeSVG(svg: string): string {
  // Remove script tags
  let cleaned = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, onerror, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  // Remove external resources (could use DOMPurify for more thorough cleaning)
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object[\s\S]*?<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed[^>]*>/gi, '');
  
  return cleaned;
}
```

**Alternative:** Use DOMPurify (more robust):
```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

### 4. Update Message Processor (`src/lib/dpulse/message-processor.ts`)

```typescript
// REMOVE: mapServiceStateToStatus() - no longer needed

// UPDATE: processMessagePayload()
function processMessagePayload(payload: HealthStatusPayload): ServiceStatus {
  return {
    name: payload.name,
    displayName: payload.displayName,
    description: payload.description,
    status: payload.status as HealthStatus,
    timestamp: new Date(payload.timestamp).getTime(),
    icon: payload.icon ? sanitizeSVG(payload.icon) : undefined,
    metadata: { source: 'filter' }
  };
}

// UPDATE: updateStatusMessageAtomic() - use 'name' as key
function updateStatusMessageAtomic(
  store: MapAtom<string, ServiceStatus>,
  payload: HealthStatusPayload
): void {
  const status = processMessagePayload(payload);
  store.set(status.name, status);  // was: status.service
}
```

### 5. Update Stores (`src/lib/dpulse/stores.ts`)

No structural changes needed. Key changes from `serviceName` to `name`:
```typescript
export const $statusMessages = atom<Map<string, ServiceStatus>>(new Map());
// Key is now 'name' instead of 'serviceName'
```

### 6. Update Status Utils (`src/lib/dpulse/utils/status.ts`)

Keep `HealthStatus` type and `STATUS_META` as fallback:

```typescript
export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export const STATUS_META: Record<HealthStatus, { 
  icon: string;  // Phosphor icon name
  color: string;
  className: string;
}> = {
  healthy: { icon: 'CheckCircle', color: 'text-green-500', className: '' },
  degraded: { icon: 'Warning', color: 'text-yellow-500', className: 'animate-spin' },
  down: { icon: 'XCircle', color: 'text-red-500', className: '' },
  unknown: { icon: 'Question', color: 'text-gray-500', className: '' }
};
```

### 7. Update UI Component (`src/components/cmd-outputs/ServicesOutput.tsx`)

```tsx
function ServiceCard({ status }: { status: ServiceStatus }) {
  // Custom icon or fallback to STATUS_META
  const IconComponent = PhosphorIcons[STATUS_META[status.status].icon];
  
  return (
    <Card>
      <CardHeader>
        {/* Custom SVG icon */}
        {status.icon ? (
          <div 
            className="w-4 h-4"
            dangerouslySetInnerHTML={{ __html: status.icon }}
          />
        ) : (
          <IconComponent className={STATUS_META[status.status].className} />
        )}
        
        {/* displayName as title */}
        <CardTitle>{status.displayName}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* description as secondary info */}
        <p className="text-muted-foreground">{status.description}</p>
        
        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(status.timestamp)}
        </span>
      </CardContent>
    </Card>
  );
}
```

### 8. Update Internationalization (`src/i18n/messages/en.json`)

```json
{
  "dpulse": {
    "serviceName": "Service",
    "status": {
      "healthy": "Healthy",
      "degraded": "Degraded",
      "down": "Down",
      "unknown": "Unknown"
    },
    "lastChecked": "Last checked"
  }
}
```

---

## File Changes Summary

| Action | File |
|--------|------|
| MODIFY | `src/lib/dpulse/types.ts` - Add new fields to ServiceStatus |
| MODIFY | `src/lib/dpulse/message-processor.ts` - New payload handling |
| MODIFY | `src/lib/dpulse/utils/status.ts` - Keep as fallback |
| MODIFY | `src/components/cmd-outputs/ServicesOutput.tsx` - UI changes |
| CREATE | `src/lib/dpulse/utils/svg-sanitize.ts` - SVG security |
| DELETE? | `src/lib/dpulse/protobuf/schema.ts` - If switching to JSON |
| DELETE? | `src/lib/dpulse/protobuf/codec.ts` - If switching to JSON |
| UPDATE | `src/i18n/messages/en.json` - New labels |

---

## Backwards Compatibility

Handle old payload format gracefully:

```typescript
function processMessagePayload(payload: any): ServiceStatus {
  // Detect old format
  const isOldFormat = 'serviceName' in payload && 'state' in payload;
  
  if (isOldFormat) {
    return {
      name: payload.serviceName,
      displayName: payload.serviceName,  // fallback
      description: payload.message ?? '',
      status: mapServiceStateToStatus(payload.state),
      timestamp: payload.timestamp,
      icon: undefined,
      metadata: { source: 'filter' }
    };
  }
  
  // New format
  return {
    name: payload.name,
    displayName: payload.displayName,
    description: payload.description,
    status: payload.status,
    timestamp: new Date(payload.timestamp).getTime(),
    icon: payload.icon ? sanitizeSVG(payload.icon) : undefined,
    metadata: { source: 'filter' }
  };
}
```

---

## UI/UX Considerations

1. **displayName**: More user-friendly, can include spaces/special chars
2. **description**: Richer context than old `message` field
3. **Custom Icons**: 
   - Takes precedence if provided
   - Fallback to STATUS_META Phosphor icons
   - Apply degraded animation (spin) if status is degraded
4. **Timestamp**: Format as relative time ("2 minutes ago")
5. **Responsive**: Test 4-column grid with longer displayName/description

---

## Testing Checklist

- [ ] Old payload format still displays correctly (backwards compat)
- [ ] New payload displays displayName as title
- [ ] New payload displays description as subtitle
- [ ] Custom SVG icon renders correctly
- [ ] Fallback to Phosphor icons when icon not provided
- [ ] XSS attempt in SVG is blocked by sanitizer
- [ ] ISO timestamp parses correctly
- [ ] Store query returns historical messages
- [ ] Filter subscription receives live updates
- [ ] Deduplication works (Store + Filter race)
- [ ] UI handles missing fields gracefully

---

## Security Considerations

**SVG Sanitization is CRITICAL**

Raw SVG strings from Waku could contain:
- `<script>` tags with XSS
- Event handlers (`onclick`, `onerror`, `onload`)
- `javascript:` URLs
- External resources (tracking, CSRF)
- `<iframe>`, `<object>`, `<embed>` embeds

**Recommendations:**
1. Use DOMPurify for robust sanitization
2. Add CSP headers to block inline scripts
3. Consider SVG proxying/sandboxing for extra security
4. Test with malicious SVG payloads before deploying
