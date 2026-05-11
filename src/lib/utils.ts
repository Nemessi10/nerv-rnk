import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDuration = (ms?: number) => {
  if (!ms) return "0:00";

  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export function formatAlbumDuration(totalMs: number) {
  const totalSeconds = Math.floor(totalMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
}