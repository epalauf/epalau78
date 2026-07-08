export type GalleryImageData = {
  id: string;
  /** Public URL of the image, or null to render a generated placeholder */
  url: string | null;
  title: string;
};

export const PLACEHOLDER_IMAGES: Omit<GalleryImageData, "url">[] = [
  { id: "ph-1", title: "Morning mist" },
  { id: "ph-2", title: "Golden hour" },
  { id: "ph-3", title: "Deep forest" },
  { id: "ph-4", title: "Quiet pond" },
  { id: "ph-5", title: "Wild meadow" },
  { id: "ph-6", title: "Mountain air" },
  { id: "ph-7", title: "First bloom" },
  { id: "ph-8", title: "Evening calm" },
];
