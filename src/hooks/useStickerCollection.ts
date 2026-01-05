import { useState, useEffect } from "react";

interface StickerData {
  collected: boolean;
  duplicates: number;
}

type StickerCollection = Record<number, StickerData>;

const STORAGE_KEY = "sticker-collection";
const TOTAL_STICKERS = 600;

const getDefaultCollection = (): StickerCollection => {
  const collection: StickerCollection = {};
  for (let i = 1; i <= TOTAL_STICKERS; i++) {
    collection[i] = { collected: false, duplicates: 0 };
  }
  return collection;
};

const loadFromStorage = (): StickerCollection => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  return getDefaultCollection();
};

const saveToStorage = (collection: StickerCollection) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const useStickerCollection = () => {
  const [collection, setCollection] = useState<StickerCollection>(loadFromStorage);

  useEffect(() => {
    saveToStorage(collection);
  }, [collection]);

  const toggleCollected = (number: number) => {
    setCollection((prev) => ({
      ...prev,
      [number]: {
        ...prev[number],
        collected: !prev[number].collected,
        duplicates: !prev[number].collected ? prev[number].duplicates : 0,
      },
    }));
  };

  const addDuplicate = (number: number) => {
    setCollection((prev) => ({
      ...prev,
      [number]: {
        ...prev[number],
        duplicates: prev[number].duplicates + 1,
      },
    }));
  };

  const removeDuplicate = (number: number) => {
    setCollection((prev) => ({
      ...prev,
      [number]: {
        ...prev[number],
        duplicates: Math.max(0, prev[number].duplicates - 1),
      },
    }));
  };

  const stats = {
    total: TOTAL_STICKERS,
    collected: Object.values(collection).filter((s) => s.collected).length,
    missing: Object.values(collection).filter((s) => !s.collected).length,
    duplicates: Object.values(collection).reduce((sum, s) => sum + s.duplicates, 0),
  };

  return {
    collection,
    toggleCollected,
    addDuplicate,
    removeDuplicate,
    stats,
    totalStickers: TOTAL_STICKERS,
  };
};
