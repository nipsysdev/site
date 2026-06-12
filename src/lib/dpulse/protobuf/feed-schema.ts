import type { Type } from 'protobufjs';
import protobuf from 'protobufjs';

export interface FeedImage {
  url: string;
  mimeType: string;
}

export interface FeedEntry {
  id: string;
  title: string;
  link: string;
  content?: string;
  author?: string;
  published?: number;
  images: FeedImage[];
}

export interface FeedBatch {
  source: string;
  fetchedAt: number;
  entries: FeedEntry[];
  signature?: string;
}

const FeedImageType = new protobuf.Type('FeedImage')
  .add(new protobuf.Field('url', 1, 'string'))
  .add(new protobuf.Field('mimeType', 2, 'string'));

const FeedEntryType = new protobuf.Type('FeedEntry')
  .add(new protobuf.Field('id', 1, 'string'))
  .add(new protobuf.Field('title', 2, 'string'))
  .add(new protobuf.Field('link', 3, 'string'))
  .add(new protobuf.Field('content', 4, 'string', 'optional'))
  .add(new protobuf.Field('author', 5, 'string', 'optional'))
  .add(new protobuf.Field('published', 6, 'int64', 'optional'))
  .add(new protobuf.Field('images', 7, 'FeedImage', 'repeated'));

const FeedBatchType = new protobuf.Type('FeedBatch')
  .add(new protobuf.Field('source', 1, 'string'))
  .add(new protobuf.Field('fetchedAt', 2, 'int64'))
  .add(new protobuf.Field('entries', 3, 'FeedEntry', 'repeated'))
  .add(new protobuf.Field('signature', 4, 'string', 'optional'));

const root = new protobuf.Root()
  .define('dpulse')
  .add(FeedImageType)
  .add(FeedEntryType)
  .add(FeedBatchType);

export const FeedBatch = root.lookupType('dpulse.FeedBatch') as unknown as Type;
