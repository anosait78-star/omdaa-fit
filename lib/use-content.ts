'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT, type SiteContent } from './content';

/**
 * Live site content for client components. Starts from the built-in defaults
 * and swaps in the coach's saved content from /api/content once loaded.
 */
export function useContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    let alive = true;
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.content) setContent(d.content as SiteContent);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return content;
}
