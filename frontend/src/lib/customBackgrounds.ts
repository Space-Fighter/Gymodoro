import type { Background } from "@/components/timer/backgrounds";

const STORAGE_KEY = "gymodoro-custom-backgrounds";
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

// Custom backgrounds are stored as data URLs in localStorage — there's no
// backend asset storage for this yet, and it's a per-browser preference like
// the rest of BackgroundView's selection. Downscaling on upload keeps a
// handful of photos from blowing past localStorage's ~5-10MB per-origin cap.

export function getCustomBackgrounds(): Background[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Background[]) : [];
  } catch {
    return [];
  }
}

function saveCustomBackgrounds(backgroundsList: Background[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backgroundsList));
  } catch {
    throw new Error(
      "Couldn't save that image — it may be too large for browser storage. Try a smaller image."
    );
  }
}

function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That doesn't look like a valid image."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas isn't supported in this browser."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function addCustomBackground(file: File): Promise<Background> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  const imageUrl = await resizeToDataUrl(file);
  const background: Background = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "Custom",
    imageUrl,
  };
  saveCustomBackgrounds([...getCustomBackgrounds(), background]);
  return background;
}

export function removeCustomBackground(id: string): void {
  saveCustomBackgrounds(getCustomBackgrounds().filter((bg) => bg.id !== id));
}

export function isCustomBackgroundId(id: string): boolean {
  return id.startsWith("custom-");
}
