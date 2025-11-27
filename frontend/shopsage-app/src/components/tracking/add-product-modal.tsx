"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddProductModalProps {
  onAdd?: (url: string, targetPrice: number) => void;
}

export function AddProductModal({ onAdd }: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  const handleSubmit = () => {
    const price = parseFloat(targetPrice);
    if (url.trim() && !isNaN(price) && price > 0) {
      onAdd?.(url.trim(), price);
      setUrl("");
      setTargetPrice("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="
            fixed
            bottom-24
            right-4
            z-30
            h-14
            w-14
            rounded-full
            bg-primary-500
            text-white
            shadow-primary
            hover:bg-primary-600
          "
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(var(--app-max-width)-32px)] rounded-[var(--radius-lg)]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-neutral-800">
            Track a Product
          </DialogTitle>
          <DialogDescription className="text-sm font-light text-neutral-500">
            Enter a product URL and your target price to start tracking.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Product URL
            </label>
            <Input
              placeholder="https://shopee.sg/product/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Target Price
            </label>
            <Input
              type="number"
              placeholder="Enter target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-primary-500 hover:bg-primary-600"
          >
            Start Tracking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

