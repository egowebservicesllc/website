import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

/**
 * Brand promo video. Loads only when scrolled near (keeps pages fast),
 * plays muted and looped like a social feed, with a tap to unmute.
 * Files live in /public/videos (all social formats are there too).
 */
export function PromoVideo({
  src = "/videos/ego-promo-16x9.mp4",
  poster = "/videos/ego-promo-16x9-poster.jpg",
  className = "",
  label = "EGO Web Services promo video with voice-over",
  captions,
}: {
  src?: string;
  poster?: string;
  className?: string;
  label?: string;
  captions?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setReduced(prefersReduced);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setLoad(true);
            if (!prefersReduced) el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (el.paused) el.play().catch(() => {});
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-video ${className}`}>
      <video
        ref={ref}
        className="w-full h-full object-cover"
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        controls={reduced}
      >
        {load && <source src={src} type="video/mp4" />}
        {captions && <track kind="captions" src={captions} srcLang="en" label="English" />}
      </video>
      {!reduced && (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-900/70 backdrop-blur px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900/90 transition-colors"
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {muted ? "Tap for sound" : "Sound on"}
        </button>
      )}
      {reduced && (
        <span className="sr-only">
          <Play /> Video controls are shown because reduced motion is enabled.
        </span>
      )}
    </div>
  );
}
