import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MIN_DISPLAY_MS = 1600;

export function Preloader() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const start = Date.now();
    const finish = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const delay = Math.max(0, MIN_DISPLAY_MS - elapsed);
      setTimeout(() => setReady(true), delay);
    };

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', finish);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => setVisible(false)}>
      {!ready && visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="glow-overlay absolute inset-0" />
          <motion.p
            className="font-headline text-sm tracking-[0.4em] uppercase text-primary/60"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Loading
          </motion.p>
          <div className="flex overflow-hidden">
            {'SUAN KC'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-on-background"
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>
          <motion.div
            className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-surface-container-high"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-dim"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}