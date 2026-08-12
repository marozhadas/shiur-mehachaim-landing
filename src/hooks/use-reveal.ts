import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal hook — attach the returned ref to any element and use `visible`
 * to toggle the lfl-reveal / lfl-reveal-scale / lfl-reveal-r "in" state.
 * Mirrors the IntersectionObserver behavior used in the HTML preview.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.01) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Positive bottom margin expands the trigger zone UPWARD past the viewport edge, so
    // content finishes fading in before it's actually scrolled into view — a negative
    // margin here (shrinking the zone) was making fast mobile scrolls outrun the fade,
    // which read as an empty gap while content "caught up".
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px 15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/** Counts up to `to` once the element scrolls into view. */
export function useCountUp(to: number, duration = 1400) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let start: number | null = null;
        const step = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(eased * to));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return { ref, value };
}
