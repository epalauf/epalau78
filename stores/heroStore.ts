import { create } from "zustand";

// Which hero chapter is on stage: 0 nature, 1 photographers, 2 artists.
// setChapter is programmatic (HeroPersonalizer cycling); pinChapter is a
// user click on a chapter pill and permanently stops the cycling.
type HeroState = {
  chapter: number;
  pinned: boolean;
  setChapter: (chapter: number) => void;
  pinChapter: (chapter: number) => void;
};

export const useHeroStore = create<HeroState>((set) => ({
  chapter: 0,
  pinned: false,
  setChapter: (chapter) => set({ chapter }),
  pinChapter: (chapter) => set({ chapter, pinned: true }),
}));
