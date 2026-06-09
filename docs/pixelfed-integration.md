# PixelFed Integration - Feature Specification

**Created:** 2026-06-09  
**Author:** Echo (Hermes Agent)  
**Status:** Planning

---

## Overview

Display photos from the user's PixelFed account on their personal website.

**PixelFed Profile:** https://pixelfed.social/xaviers  
**Feed URL:** https://pixelfed.social/users/xaviers.atom

---

## Chosen Approach: Atom Feed

### Why Atom over alternatives?

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Atom Feed** | No auth required, public endpoint, simple parsing | Compressed images, no engagement metrics | ✅ **Chosen for MVP** |
| Mastodon API | Full media URLs, rich data | Requires auth token, token management | Future enhancement |
| ActivityPub | Full federation support | PixelFed doesn't expose outbox publicly, requires HTTP Signatures | Overkill |
| Iframe embed | Zero code | Limited customization, not on-brand | ❌ Rejected |

---

## Feed Analysis

### Feed URL
```
https://pixelfed.social/users/xaviers.atom
```

### XML Structure

**Namespaces:**
```xml
xmlns="http://www.w3.org/2005/Atom"
xmlns:media="http://search.yahoo.com/mrss/"
```

### Feed-Level Metadata

| Element | Example | Purpose |
|---------|---------|---------|
| `<id>` | `https://pixelfed.social/users/xaviers.atom` | Unique feed identifier |
| `<title>` | `xaviers on pixelfed.social` | Feed title |
| `<subtitle type="html">` | `French web developer & nature lover...` | User bio |
| `<updated>` | `2022-12-28T18:01:48.000Z` | Last update timestamp |
| `<author><name>` | `xaviers` | Username |
| `<author><uri>` | `https://pixelfed.social/xaviers` | Profile URL |
| `<icon>` / `<logo>` | Avatar URL | User avatar |

### Entry-Level Elements (Per Post)

| Element | Example | Purpose |
|---------|---------|---------|
| `<id>` | `https://pixelfed.social/p/xaviers/513775851005047797` | Unique post ID/URL |
| `<title>` | Post caption (first line) | Post title |
| `<updated>` | `2022-12-28T18:01:48.000Z` | Post timestamp (ISO 8601) |
| `<content type="html">` | Full HTML with images | **Primary image source** |
| `<summary type="html">` | HTML-encoded caption | Short text summary |
| `<link rel="alternate">` | Post URL | Link to original post |
| `<media:content>` | Image metadata | **Secondary image source** |

### How Images Are Represented

**Method 1: Media RSS `<media:content>` (Recommended for parsing)**
```xml
<media:content 
  url="https://pxscdn.com/public/m/_v2/.../image.jpg" 
  type="image/jpeg" 
  medium="image" />
```

- Multiple `<media:content>` elements per entry = multi-photo posts
- CDN domains: `pxscdn.com` or `pixelfed-prod.nyc3.digitaloceanspaces.com`

**Method 2: Embedded HTML in `<content>`**
```html
<![CDATA[
<div class="media-gallery">
  <img class="media-item" 
       src="https://pxscdn.com/public/m/_v2/.../image.jpg" 
       alt="Description">
</div>
<p style="padding:10px;">Caption text here</p>
]]>
```

---

## TypeScript Interfaces

```typescript
interface PixelFedFeed {
  id: string;
  title: string;
  subtitle: string;
  updated: string;
  author: {
    name: string;
    uri: string;
  };
  icon: string;
  entries: PixelFedEntry[];
}

interface PixelFedEntry {
  id: string;              // Unique post identifier (URL)
  title: string;           // Caption/title
  summary: string;         // HTML summary
  content: string;         // Full HTML content
  updated: string;         // ISO timestamp
  link: string;            // Post URL
  images: PixelFedImage[]; // Parsed from media:content
}

interface PixelFedImage {
  url: string;             // CDN image URL
  type: string;            // MIME type (image/jpeg)
  alt?: string;            // Description (from content HTML)
}
```

---

## Implementation Guide

### 1. Fetch Feed

```typescript
// lib/pixelfed.ts
const PIXELFED_FEED_URL = 'https://pixelfed.social/users/xaviers.atom';

export async function fetchPixelFedFeed(): Promise<string> {
  const response = await fetch(PIXELFED_FEED_URL, {
    next: { revalidate: 3600 }, // Cache 1 hour (ISR)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PixelFed feed: ${response.status}`);
  }
  
  return response.text();
}
```

### 2. Parse XML

**Recommended libraries:**
- `fast-xml-parser` - Fast, lightweight
- `xml2js` - More feature-rich

```typescript
import { XMLParser } from 'fast-xml-parser';

export function parsePixelFedFeed(xml: string): PixelFedFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  
  const parsed = parser.parse(xml);
  const feed = parsed.feed;
  
  return {
    id: feed.id,
    title: feed.title,
    subtitle: feed.subtitle,
    updated: feed.updated,
    author: {
      name: feed.author.name,
      uri: feed.author.uri,
    },
    icon: feed.icon,
    entries: parseEntries(feed.entry),
  };
}

function parseEntries(entries: any[]): PixelFedEntry[] {
  // Handle single entry (not array)
  const entryArray = Array.isArray(entries) ? entries : [entries];
  
  return entryArray.map(entry => ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    content: entry.content,
    updated: entry.updated,
    link: extractLink(entry.link),
    images: extractImages(entry['media:content']),
  }));
}
```

### 3. React Component

```tsx
// components/gallery/PixelFedGallery.tsx
import Image from 'next/image';
import { fetchPixelFedFeed, parsePixelFedFeed } from '@/lib/pixelfed';

export async function PixelFedGallery() {
  const xml = await fetchPixelFedFeed();
  const feed = parsePixelFedFeed(xml);
  
  return (
    <div className="gallery">
      {feed.entries.map((entry) => (
        <article key={entry.id} className="gallery-item">
          {entry.images.map((image, idx) => (
            <Image
              key={`${entry.id}-${idx}`}
              src={image.url}
              alt={image.alt || entry.title}
              width={400}
              height={400}
              unoptimized // CDN URLs, skip Next.js optimization
            />
          ))}
          <p>{entry.title}</p>
          <time dateTime={entry.updated}>
            {new Date(entry.updated).toLocaleDateString()}
          </time>
        </article>
      ))}
    </div>
  );
}
```

---

## Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| No image dimensions | Can't pre-set aspect ratio | Use CSS `object-fit` or aspect-ratio containers |
| No thumbnail URLs | Only full-size images | Use Next.js Image resizing or CSS |
| No likes/comments count | No engagement metrics | Not available via Atom |
| No tags/hashtags | Can't filter by tag | Not exposed in Atom format |
| Alt text often empty | Accessibility | Use title/caption as fallback |
| Potential encoding issues | Unicode characters | Normalize with `normalize('NFC')` |

---

## Future Enhancements

### Mastodon API Integration

If Atom feed proves insufficient, migrate to Mastodon-compatible API:

**Endpoint:**
```
GET /api/v1/accounts/:id/statuses?only_media=true
```

**Requirements:**
1. Create application at `https://pixelfed.social/settings/applications`
2. Generate Personal Access Token with `read` scope
3. Store token in environment variable: `PIXELFED_TOKEN`
4. Get account ID via `/api/v1/accounts/verify_credentials`

**Example:**
```typescript
const response = await fetch(
  'https://pixelfed.social/api/v1/accounts/ACCOUNT_ID/statuses?only_media=true&limit=20',
  {
    headers: {
      'Authorization': `Bearer ${process.env.PIXELFED_TOKEN}`,
    },
  }
);
```

**Advantages over Atom:**
- Full-resolution image URLs
- Favourites/reblogs count
- Hashtags
- Better structured media attachments

---

## Resources

- **PixelFed Profile:** https://pixelfed.social/xaviers
- **Atom Feed:** https://pixelfed.social/users/xaviers.atom
- **Atom 1.0 Spec:** https://www.ietf.org/rfc/rfc4287.txt
- **Media RSS Spec:** https://www.rssboard.org/media-rss
- **fast-xml-parser:** https://github.com/NaturalIntelligence/fast-xml-parser
- **Mastodon API Docs:** https://docs.joinmastodon.org/methods/accounts/#statuses

---

## Task Checklist

When implementing this feature:

- [ ] Create `/lib/pixelfed.ts` with fetch and parse functions
- [ ] Create `/components/gallery/PixelFedGallery.tsx`
- [ ] Add environment variables if using API (future)
- [ ] Add loading skeleton
- [ ] Add error handling for feed fetch failures
- [ ] Style with existing LSD design system
- [ ] Consider ISR revalidation strategy
- [ ] Add "View on PixelFed" links for each post
- [ ] Handle multi-photo posts (carousel? grid?)
- [ ] Mobile responsive layout
