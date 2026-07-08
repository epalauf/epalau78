import { create } from "zustand";
import {
  ASSET_DEFAULTS,
  DEFAULT_ENVIRONMENT,
  DEFAULT_GROUND_COLOR,
  createSceneData,
  type AssetId,
  type EnvironmentSettings,
  type SceneData,
  type SceneObject,
} from "@/lib/scene";

type EditorState = {
  objects: SceneObject[];
  selectedId: string | null;
  placingAsset: AssetId | null;
  environment: EnvironmentSettings;
  groundColor: string;
  isDraggingObject: boolean;
  /** id + title of the creation being edited, when loaded from the DB */
  creationId: string | null;
  title: string;

  setPlacingAsset: (asset: AssetId | null) => void;
  placeObject: (position: [number, number, number]) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, patch: Partial<Omit<SceneObject, "id">>) => void;
  removeObject: (id: string) => void;
  setDraggingObject: (dragging: boolean) => void;
  setEnvironment: (patch: Partial<EnvironmentSettings>) => void;
  setEffect: (
    effect: keyof EnvironmentSettings["effects"],
    on: boolean,
  ) => void;
  setGroundColor: (color: string) => void;
  setTitle: (title: string) => void;
  serialize: () => SceneData;
  loadScene: (data: SceneData, creationId: string | null, title: string) => void;
  clearScene: () => void;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: [],
  selectedId: null,
  placingAsset: null,
  environment: DEFAULT_ENVIRONMENT,
  groundColor: DEFAULT_GROUND_COLOR,
  isDraggingObject: false,
  creationId: null,
  title: "",

  setPlacingAsset: (asset) =>
    set({ placingAsset: asset, selectedId: asset ? null : get().selectedId }),

  placeObject: (position) => {
    const asset = get().placingAsset;
    if (!asset) return;
    const defaults = ASSET_DEFAULTS[asset];
    const object: SceneObject = {
      id: crypto.randomUUID(),
      asset,
      position,
      rotationY: Math.random() * Math.PI * 2,
      scale: defaults.scale,
      tint: defaults.tint,
    };
    set({ objects: [...get().objects, object], selectedId: object.id });
  },

  selectObject: (id) => set({ selectedId: id, placingAsset: null }),

  updateObject: (id, patch) =>
    set({
      objects: get().objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }),

  removeObject: (id) =>
    set({
      objects: get().objects.filter((o) => o.id !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
    }),

  setDraggingObject: (dragging) => set({ isDraggingObject: dragging }),

  setEnvironment: (patch) =>
    set({ environment: { ...get().environment, ...patch } }),

  setEffect: (effect, on) =>
    set({
      environment: {
        ...get().environment,
        effects: { ...get().environment.effects, [effect]: on },
      },
    }),

  setGroundColor: (color) => set({ groundColor: color }),
  setTitle: (title) => set({ title }),

  serialize: () =>
    createSceneData(get().objects, get().environment, get().groundColor),

  loadScene: (data, creationId, title) =>
    set({
      objects: data.objects,
      environment: data.environment,
      groundColor: data.terrain.groundColor,
      selectedId: null,
      placingAsset: null,
      creationId,
      title,
    }),

  clearScene: () =>
    set({
      objects: [],
      selectedId: null,
      placingAsset: null,
      environment: DEFAULT_ENVIRONMENT,
      groundColor: DEFAULT_GROUND_COLOR,
      creationId: null,
      title: "",
    }),
}));
