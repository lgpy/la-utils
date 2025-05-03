"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Upload, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Loader2 } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { useToast } from "@/components/ui/use-toast";

type OCRResult = {
  itemId: string;
  lowestPrice: number;
};

export default function PricesOCR() {
  const { store, hasHydrated } = usePriceStore((state) => state);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    toast({
      title: "Success!",
      description: "Prices updated successfully.",
    });
  };

  return (
    <DialogContent className="w-full max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          OCR Price Extraction
        </DialogTitle>
        <DialogDescription>
          Upload an image of the game and extract the prices using OCR.
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

          {imagePreview && (
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
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && !isProcessing && (
            <div className="w-full mt-4 p-3 border rounded-md bg-muted relative">
              <Button variant="outline" className="absolute right-2 top-2" onClick={applyChanges}>
                Apply
              </Button>
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
        {result === null && (
          <Button
            onClick={processImage}
            disabled={isProcessing || !imagePreview}
          >
            {
              isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Process Image
                </>
              )}
          </Button>
        )}

      </DialogFooter >
    </DialogContent >
  );
}
