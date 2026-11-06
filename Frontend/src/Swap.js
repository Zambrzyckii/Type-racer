import { useCallback, useEffect, useRef, useState } from "react";

const LEAVE_LIMIT = 700;
const ENTER_LIMIT = 900;

// Shows a change of `key` in two phases: the old value leaves, then the new one enters.
// Each phase ends when a CSS animation named "tr-*" finishes on the element that gets
// `onAnimationEnd`; the limits keep a phase from waiting for an animation that is not there.
export const useSwap = (value, key = value) => {
  const latest = useRef(null);
  latest.current = { value, key };
  const [swap, setSwap] = useState({ shown: latest.current, state: null });

  const advance = useCallback(() => {
    setSwap((s) => {
      if (s.state === "leave") return { shown: latest.current, state: "enter" };
      if (s.state === "enter") return { ...s, state: null };
      return s;
    });
  }, []);

  useEffect(() => {
    if (key !== swap.shown.key && swap.state !== "leave") setSwap((s) => ({ ...s, state: "leave" }));
  }, [key, swap]);

  useEffect(() => {
    if (!swap.state) return;
    const limit = setTimeout(advance, swap.state === "leave" ? LEAVE_LIMIT : ENTER_LIMIT);
    return () => clearTimeout(limit);
  }, [swap.state, advance]);

  const onAnimationEnd = (e) => {
    if (e.target === e.currentTarget && e.animationName.startsWith("tr-")) advance();
  };

  return [key === swap.shown.key ? value : swap.shown.value, swap.state, onAnimationEnd];
};
