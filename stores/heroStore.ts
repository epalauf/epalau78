import { create } from "zustand";

// Which hero chapter is on stage: 0 nature, 1 photographers, 2 artists.
// Set by the 3D chapter clock, read by the DOM overlay caption.
type HeroState = {
  chapter: number;
  setChapter: (chapter: number) => void;
};

export const useHeroStore = create<HeroState>((set) => ({
  chapter: 0,
  setChapter: (chapter) => set({ chapter }),
}));
