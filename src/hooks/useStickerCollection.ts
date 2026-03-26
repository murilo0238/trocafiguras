import { useState, useEffect } from "react";
import { getAllStickerIds, TOTAL_STICKERS } from "@/data/teams";

interface StickerData {
  collected: boolean;
  duplicates: number;
}

type StickerCollection = Record<string, StickerData>;

const STORAGE_KEY = "sticker-collection-v2";

const ALL_IDS = getAllStickerIds();

const getDefaultCollection = (): StickerCollection => {
  const collection: StickerCollection = {};
  for (const id of ALL_IDS) {
    collection[id] = { collected: false, duplicates: 0 };
  }
  return collection;
};

const loadFromStorage = (): StickerCollection => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StickerCollection;
      // Merge with defaults to handle new stickers
      const defaults = getDefaultCollection();
      return { ...defaults, ...parsed };
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  return getDefaultCollection();
};

const saveToStorage = (collection: StickerCollection) => {
  try {
    // Only save stickers with data to reduce storage size
    const toSave: StickerCollection = {};
    for (const [id, data] of Object.entries(collection)) {
      if (data.collected || data.duplicates > 0) {
        toSave[id] = data;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const useStickerCollection = () => {
  const [collection, setCollection] = useState<StickerCollection>(loadFromStorage);

  useEffect(() => {
    saveToStorage(collection);
  }, [collection]);

  const toggleCollected = (id: string) => {
    setCollection((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        collected: !prev[id]?.collected,
        duplicates: !prev[id]?.collected ? (prev[id]?.duplicates || 0) : 0,
      },
    }));
  };

  const addDuplicate = (id: string) => {
    setCollection((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        duplicates: (prev[id]?.duplicates || 0) + 1,
      },
    }));
  };

  const removeDuplicate = (id: string) => {
    setCollection((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        duplicates: Math.max(0, (prev[id]?.duplicates || 0) - 1),
      },
    }));
  };

  const values = Object.values(collection);
  const stats = {
    total: TOTAL_STICKERS,
    collected: values.filter((s) => s.collected).length,
    missing: TOTAL_STICKERS - values.filter((s) => s.collected).length,
    duplicates: values.reduce((sum, s) => sum + s.duplicates, 0),
  };

  return {
    collection,
    toggleCollected,
    addDuplicate,
    removeDuplicate,
    stats,
    allStickerIds: ALL_IDS,
  };
};
