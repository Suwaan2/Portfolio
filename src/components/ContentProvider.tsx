import { useEffect, useState, type ReactNode } from 'react';
import type { Content } from '../../shared/schema';
import { ContentContext, contentRequest } from '../lib/content';

// Renders children only once content has arrived (or fallen back), so sections never swap text after mount
export function ContentProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState<Content | null>(null);

    useEffect(() => {
        let active = true;
        contentRequest.then((c) => active && setContent(c));
        return () => {
            active = false;
        };
    }, []);

    if (!content) return null;
    return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
