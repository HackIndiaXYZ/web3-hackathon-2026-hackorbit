'use client';

import React, { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 1.5, decimals = 0 }: { value: number, duration?: number, decimals?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}
