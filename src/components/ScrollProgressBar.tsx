import { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

function supportsScrollTimeline() {
  return typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');
}

export function ScrollProgressBar() {
  const [cssSupported] = useState(supportsScrollTimeline);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  if (cssSupported) {
    return <div className="scroll-progress" aria-hidden="true" />;
  }

  return (
    <motion.div
      className="scroll-progress-fallback fixed top-0 left-0 right-0 h-[3px] z-[60] bg-gradient-to-r from-primary to-primary-dim origin-left pointer-events-none"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}