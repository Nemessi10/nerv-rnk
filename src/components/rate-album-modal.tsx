"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import type { AppAlbum } from "~/types/album";

interface RateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: AppAlbum;
  currentRating?: number;
  onSuccess: (newRating: number) => void;
}

export function RateAlbumModal({
  isOpen,
  onClose,
  album,
  currentRating,
  onSuccess,
}: RateAlbumModalProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Оновлюємо значення інпута, коли відкриваємо модалку з існуючим рейтингом
  useEffect(() => {
    if (isOpen) {
      setValue(currentRating?.toString() ?? "");
    }
  }, [isOpen, currentRating]);

  const handleSubmit = async () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) {
      alert("Please enter a rating between 0 and 10");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album, rating: numValue }),
      });

      if (!res.ok) throw new Error("Failed to save rating");

      onSuccess(numValue);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate {album.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rating">Rating (1-10)</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 6.9"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
