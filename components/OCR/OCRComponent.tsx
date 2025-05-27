"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Upload, CheckCircle2, ScanText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";

type OCRResult = {
  itemId: string;
  lowestPrice: number;
};

type PricesOCRProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PricesOCR({ isOpen, onOpenChange }: PricesOCRProps) {
  const { store, hasHydrated } = usePriceStore((state) => state);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ph = usePostHog();

  // Handle paste events globally
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // Reset states
            setError(null);
            setResult(null);

            // Create File from the blob
            const file = new File([blob], "pasted-image.png", { type: blob.type });

            // Create image preview
            const reader = new FileReader();
            reader.onload = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Update file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (fileInputRef.current) {
              fileInputRef.current.files = dataTransfer.files;
            }

            break;
          }
        }
      }
    };

    // Add global paste event listener
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setResult(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("Please select an image first");
      return;
    }

    const file = fileInputRef.current.files[0];
    setIsProcessing(true);
    ph.capture('OCR Image Upload');

    try {
      const formData = new FormData();
      formData.append("file", file);


      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process image");
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetStates = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsProcessing(false);
  }

  const applyChanges = () => {
    if (!result) return;
    for (const item of result) {
      store.changePrice(item.itemId, item.lowestPrice);
    }
    resetStates();
    toast.success("Prices updated successfully.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setTimeout(() => {
          resetStates();
        }, 200);
      }
    }}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanText className="h-5 w-5" />
            OCR Price Extraction
          </DialogTitle>
          <DialogDescription>
            Upload an image of the game and extract the prices using OCR.
            You can also paste an image (Ctrl+V) directly from your clipboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={isProcessing}
            />

            {imagePreview && result === null && (
              <div className="relative w-full h-48 mt-4 border rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && !isProcessing && (
              <div className="w-full mt-4 p-3 border rounded-md bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">OCR Results</h3>
                </div>
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-60">
                  {result.map((item, index) => (
                    <div key={index}>
                      {item.itemId} &gt; {item.lowestPrice}
                    </div>
                  ))}
                </pre>
                {/* button on the right side */}
              </div>
            )}
          </div>
        </div >

        <DialogFooter className="flex justify-end">
          {result === null ? (
            <Button
              onClick={processImage}
              disabled={isProcessing || !imagePreview}
            >
              {
                isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload />
                    Process Image
                  </>
                )}
            </Button>

          ) : (
            <>
              <Button variant="destructive" onClick={resetStates} className="mr-2">
                Cancel
              </Button>
              <Button onClick={applyChanges}>
                Apply Changes
              </Button>
            </>
          )}

        </DialogFooter >

      </DialogContent >
    </Dialog>
  );
}
