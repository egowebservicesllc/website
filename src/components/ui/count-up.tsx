import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

/**
 * Animated counter. It now renders the final value in the initial HTML
 * (previously "0", which is what crawlers, link previews and anyone with
 * reduced motion saw) and only counts up once it scrolls into view.
 */
export function CountUp({
  end,
  from = 0,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  end: number;
  from?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(end);

  useEffect(() => {
    if (!isInView) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const controls = animate(from, end, {
      duration,
      onUpdate(value) {
        setDisplay(Math.round(value));
      },
    });
    return controls.stop;
  }, [isInView, end, from, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
