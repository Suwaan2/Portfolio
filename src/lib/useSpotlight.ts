import { useEffect } from 'react';

/**
 * One delegated listener feeds the pointer position into any `.spotlight` card
 * as --mx/--my, which the CSS turns into a soft glow that follows the cursor.
 */
export function useSpotlight() {
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const onMove = (e: PointerEvent) => {
            const card = (e.target as Element | null)?.closest?.<HTMLElement>('.spotlight');
            if (!card) return;
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        };

        document.addEventListener('pointermove', onMove, { passive: true });
        return () => document.removeEventListener('pointermove', onMove);
    }, []);
}
