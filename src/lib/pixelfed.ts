import { XMLParser } from 'fast-xml-parser';

const FEED_URL = 'https://pixelfed.social/users/xaviers.atom';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export interface PixelFedFeed {
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

export interface PixelFedEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  updated: string;
  link: string;
  images: PixelFedImage[];
}

export interface PixelFedImage {
  url: string;
  type: string;
  alt?: string;
}

interface RawAtomLink {
  '@_href': string;
  '@_rel'?: string;
}

interface RawMediaContent {
  '@_url': string;
  '@_type': string;
  '@_medium': string;
}

interface RawAtomEntry {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  updated: string;
  link: RawAtomLink | RawAtomLink[];
  'media:content': RawMediaContent | RawMediaContent[];
}

export async function fetchPixelFedFeed(): Promise<string> {
  const response = await fetch(FEED_URL, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch PixelFed feed: ${response.status}`);
  }

  return response.text();
}

export function parsePixelFedFeed(xml: string): PixelFedFeed {
  const parsed = parser.parse(xml);
  const feed = parsed.feed;

  const rawEntries = feed.entry;
  const entriesArray: RawAtomEntry[] = Array.isArray(rawEntries)
    ? rawEntries
    : rawEntries
      ? [rawEntries]
      : [];

  const entries: PixelFedEntry[] = entriesArray.map((entry: RawAtomEntry) => ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary || '',
    content: entry.content || '',
    updated: entry.updated,
    link: extractLink(entry.link),
    images: extractImages(entry['media:content']),
  }));

  return {
    id: feed.id,
    title: feed.title,
    subtitle: feed.subtitle || '',
    updated: feed.updated,
    author: {
      name: feed.author.name,
      uri: feed.author.uri,
    },
    icon: feed.icon || '',
    entries,
  };
}

export function extractLink(link: RawAtomLink | RawAtomLink[]): string {
  if (!link) return '';
  if (Array.isArray(link)) {
    const selfLink = link.find(
      (l) => l['@_rel'] === 'self' || l['@_rel'] === 'alternate',
    );
    return selfLink?.['@_href'] || link[0]?.['@_href'] || '';
  }
  return link['@_href'] || '';
}

export function extractImages(
  mediaContent: RawMediaContent | RawMediaContent[],
): PixelFedImage[] {
  if (!mediaContent) return [];

  const items = Array.isArray(mediaContent) ? mediaContent : [mediaContent];

  return items
    .filter((item: RawMediaContent) => item['@_medium'] === 'image')
    .map((item: RawMediaContent) => ({
      url: item['@_url'],
      type: item['@_type'],
    }));
}
