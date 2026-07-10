"use client";

import { useEffect } from "react";
import { useHeroStore } from "@/stores/heroStore";

const CYCLE_MS = 12000;

/**
 * Steers the hero toward the signed-in user's scenario chapters:
 * starts on the first one and slowly cycles through the rest.
 * A manual chapter-pill click (pinned) wins and stops the cycling.
 */
export default function HeroPersonalizer({
  chapters,
}: Readonly<{ chapters: number[] }>) {
  useEffect(() => {
    if (chapters.length === 0 || useHeroStore.getState().pinned) return;
    useHeroStore.getState().setChapter(chapters[0]);
    if (chapters.length < 2) return;

    let index = 0;
    const interval = setInterval(() => {
      const { pinned, setChapter } = useHeroStore.getState();
      if (pinned) {
        clearInterval(interval);
        return;
      }
      index = (index + 1) % chapters.length;
      setChapter(chapters[index]);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [chapters]);

  return null;
}
