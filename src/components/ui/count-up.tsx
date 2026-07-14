import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, end, {
        duration,
        onUpdate(value) {
          setDisplay(Math.round(value));
        },
      });
      return controls.stop;
    }
    return undefined;
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
