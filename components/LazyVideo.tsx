'use client';

/**
 * LazyVideo — controls `preload` behavior and supports a poster image,
 * so below-the-fold videos don't eat bandwidth at first paint.
 *
 * Usage:
 *   <LazyVideo src="/x.mp4" eager />            // hero — `preload="metadata"`
 *   <LazyVideo src="/x.mp4" poster="/x.webp" /> // gallery — `preload="none"`
 */

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** Above-the-fold: preload metadata. Below: preload="none" + IntersectionObserver. */
  eager?: boolean;
  /** If set, unmutes the video (e.g. a hero showcase). Default: muted. */
  sound?: boolean;
}

export default function LazyVideo({
  src,
  poster,
  className,
  eager = false,
  sound = false,
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(eager);

  /* ── IntersectionObserver — only pay for the download once the video
     is about to scroll into view (rootMargin gives us a 200 px lead). */
  useEffect(() => {
    if (eager || inView) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, inView]);

  return (
    <video
      ref={ref}
      src={inView ? src : undefined}
      poster={poster}
      className={className}
      autoPlay
      loop
      muted={!sound}
      playsInline
      preload={eager ? 'metadata' : 'none'}
      // `disableRemotePlayback` blocks Android/iOS "cast" buttons on autoplay loops
      disableRemotePlayback
    />
  );
}
