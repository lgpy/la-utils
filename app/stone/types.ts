// Global type declarations for ImageCapture API
declare global {
  interface ImageCapture {
    grabFrame(): Promise<ImageBitmap>;
    getPhotoCapabilities(): Promise<any>;
    getPhotoSettings(): Promise<any>;
    takePhoto(photoSettings?: any): Promise<Blob>;
  }
  var ImageCapture: {
    prototype: ImageCapture;
    new(track: MediaStreamTrack): ImageCapture;
  };
  interface ImageBitmap {
    readonly width: number;
    readonly height: number;
    close(): void;
  }
}

export interface PixelCoordinate {
  x: number;
  y: number;
}

export interface PixelTarget {
  id: string;
  name: string;
  x: number;
  y: number;
  line: number;
  isMatch: boolean;
  detectedStatus: string;
}

export interface StoneState { line1: string[], line2: string[], line3: string[], percentage: number }
