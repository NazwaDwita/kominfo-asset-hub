import { useEffect, useRef, useState, type ReactNode } from "react";

type Variant =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "card-flip"
  | "blur"
  | "typewriter";

interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
  once = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const Component = Tag as any;
  return (
    <Component
      ref={ref as any}
      data-reveal={variant}
      data-shown={shown ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Component>
  );
}

export function Typewriter({
  text,
  className = "",
  speed = 35,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [out, setOut] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            setStarted(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [started, text, speed]);

  return (
    <span ref={ref} className={className}>
      {out}
      <span className="typewriter-caret">▌</span>
    </span>
  );
}
