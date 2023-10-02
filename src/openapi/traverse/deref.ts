import type { openapi } from '../types/opanapi'

export const deref = (doc: openapi.Document, ref: openapi.Reference) =>
  ref.$ref
    .replace('#/', '')
    .split('/')
    .reduce(
      (obj, key) =>
        // @ts-expect-error ???
        obj ? (obj as Record<string, unknown>)[key] : null,
      doc,
    )
