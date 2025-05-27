'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { classifyPixelColor, rgbToHsl } from './utils';
import { PixelTarget, type StoneState } from './types';
import ControlsCard from './ControlsCard';
import SessionInfoCard from './SessionInfoCard';
import TargetOverviewCard from './TargetOverviewCard';
import LiveFeedCard from './LiveFeedCard'; // Added import
import Tesseract from 'tesseract.js'; // Added Tesseract.js import
import {
  PREDEFINED_TARGETS,
  SPIRAL_OFFSETS_5X5,
  CROP_X,
  CROP_Y,
  CROP_WIDTH,
  CROP_HEIGHT
} from './constants';
import StoneStatus from './StoneStatus';

function parseTargets(currentTargets: PixelTarget[], fullSourceCanvas: HTMLCanvasElement, fullSourceCtx: CanvasRenderingContext2D) {
  return currentTargets.map(target => {
    const { x, y, name: targetName } = target; // Ensure targetName is available via name property
    let finalRgb = { r: 0, g: 0, b: 0 }, detectedClassification: string | null = null;
    let pixelFound = false;

    for (const offset of SPIRAL_OFFSETS_5X5) {
      const checkX = x + offset.dx;
      const checkY = y + offset.dy;
      if (checkX >= 0 && checkY >= 0 && checkX < fullSourceCanvas.width && checkY < fullSourceCanvas.height) {
        const [r, g, b] = fullSourceCtx.getImageData(checkX, checkY, 1, 1).data;
        const [h, s, l] = rgbToHsl(r, g, b);
        const classification = classifyPixelColor(h, s, l);
        if (classification !== null) {
          detectedClassification = classification; finalRgb = { r, g, b }; pixelFound = true;
          // New Log when a pixel is classified and chosen
          break;
        }
      } else {
        console.error(`Target ${targetName}: Scan at (${checkX},${checkY}) is out of fullSourceCanvas bounds.`);
      }
    }
    let finalStatus: string;

    if ((target.line === 1 || target.line === 2) && detectedClassification === "blue") finalStatus = "success";
    else if (target.line === 3 && detectedClassification === "red") finalStatus = "success";
    else if (detectedClassification === "grey") finalStatus = "failure";
    else if (detectedClassification === "black") finalStatus = "pending";
    else finalStatus = "unknown";

    return { ...target, actualR: finalRgb.r, actualG: finalRgb.g, actualB: finalRgb.b, isMatch: pixelFound, detectedStatus: finalStatus };
  });
}


function PredictPercentage(oldState: StoneState, newState: Omit<StoneState, 'percentage'>): number | null {
  let oldCount = { failures: 0, successes: 0 };
  let newCount = { failures: 0, successes: 0 };

  const statusChecker = (status: string, obj: { failures: number; successes: number }) => {
    switch (status) {
      case 'success':
        obj.successes++;
        break;
      case 'failure':
        obj.failures++;
        break;
      default:
        break;
    }
  };

  oldState.line1.forEach(status => statusChecker(status, oldCount));
  oldState.line2.forEach(status => statusChecker(status, oldCount));
  oldState.line3.forEach(status => statusChecker(status, oldCount));
  newState.line1.forEach(status => statusChecker(status, newCount));
  newState.line2.forEach(status => statusChecker(status, newCount));
  newState.line3.forEach(status => statusChecker(status, newCount));

  const totalOld = oldCount.successes + oldCount.failures;
  const totalNew = newCount.successes + newCount.failures;
  const totaldiff = totalNew - totalOld;

  if (totaldiff === 0) return oldState.percentage; // No change in total, return old percentage

  if (totaldiff === 1 && newCount.successes > oldCount.successes) {
    // If one more success, increase percentage by 10%
    return Math.min(oldState.percentage + 10, 75);
  } else if (totaldiff === 1 && newCount.failures > oldCount.failures) {
    // If one more failure, decrease percentage by 10%
    return Math.max(oldState.percentage - 10, 25);
  }

  console.debug(`PredictPercentage: Unexpected totaldiff: ${totaldiff}, oldCount: ${JSON.stringify(oldCount)}, newCount: ${JSON.stringify(newCount)}`);
  return null;
}

export default function Stone() {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // Added videoRef
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImageSrc, setCapturedImageSrc] = useState<string | null>(null);
  const [isAutomating, setIsAutomating] = useState<boolean>(false);
  const [targets, setTargets] = useState<PixelTarget[]>(PREDEFINED_TARGETS.map(target => target));
  const [ocrText, setOcrText] = useState<string | undefined>(undefined);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  const tesseractWorkerRef = useRef<Tesseract.Worker | null>(null);
  const [tesseractWorkerReady, setTesseractWorkerReady] = useState(false);

  const [stoneInfo, setStoneInfo] = useState<StoneState>();


  useEffect(() => {
    // Cleanup function to stop screen share when the component unmounts
    return () => {
      if (mediaStream?.active) {
        stopScreenShare();
      }
    };
  }, [mediaStream]); // Add mediaStream to dependency array to re-run if it changes, though primarily for unmount

  // Initialize and terminate Tesseract worker
  useEffect(() => {
    const initializeTesseractWorker = async () => {
      try {
        const worker = await Tesseract.createWorker('eng', 1, {
          // logger: m => console.log(m) // Uncomment for detailed logs
        });

        // Set parameters to optimize for "XX%" patterns
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789%', // Only recognize digits and percent sign
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE, // Treat the image as a single text line (PSM_SINGLE_LINE)
        });

        tesseractWorkerRef.current = worker;
        setTesseractWorkerReady(true);
        console.debug("Tesseract worker initialized and ready.");
      } catch (error) {
        console.error("Failed to initialize Tesseract worker:", error);
      }
    };

    initializeTesseractWorker();

    return () => {
      if (tesseractWorkerRef.current) {
        console.log("Terminating Tesseract worker...");
        tesseractWorkerRef.current.terminate()
          .then(() => console.log("Tesseract worker terminated successfully."))
          .catch(err => console.error("Error terminating Tesseract worker:", err));
        tesseractWorkerRef.current = null;
        setTesseractWorkerReady(false);
      }
    };
  }, []); // Empty dependency array: runs on mount, cleans up on unmount

  useEffect(() => {
    if (ocrText === undefined) {
      console.debug("OCR text is undefined, skipping processing.");
      return;
    }
    //ocrText needs to be 75 65 55 45 35 25 and optionally have % at the end
    const Acceptable_Percentages = [75, 65, 55, 45, 35, 25];
    const percentage = ocrText.trim().match(/^(\d{2})(?:\%)?$/);
    let percentageValue: number | undefined;
    let ocrWasSuccessful = false;

    if (percentage) {
      percentageValue = parseInt(percentage[1], 10);
      if (!isNaN(percentageValue)) {
        if (Acceptable_Percentages.includes(percentageValue)) {
          ocrWasSuccessful = true;
        } else {
          console.debug(`Percentage ${percentageValue} is not in the acceptable range.`);
          ocrWasSuccessful = false;
        }
      } else {
        console.debug("Parsed percentage is NaN.");
        ocrWasSuccessful = false;
      }
    } else {
      console.debug(`OCR text does not match expected format: "${ocrText}".`);
      ocrWasSuccessful = false;
    }

    if (targets.some(target => target.detectedStatus === 'unknown' || !target.isMatch)) {
      console.debug("Not all targets are matched or have unknown status.");
      return;
    }

    const line1 = targets.filter(target => target.line === 1).map(target => target.detectedStatus);
    const line2 = targets.filter(target => target.line === 2).map(target => target.detectedStatus);
    const line3 = targets.filter(target => target.line === 3).map(target => target.detectedStatus);

    setStoneInfo(currentStoneInfo => {
      if (!ocrWasSuccessful && currentStoneInfo) {
        const predict = PredictPercentage(currentStoneInfo, {
          line1,
          line2,
          line3
        });

        if (predict !== null) {
          percentageValue = predict;
          console.debug(`Predicting percentage based on current state: ${percentageValue}`);
        }
      }

      if (percentageValue === undefined) {
        console.debug("No valid percentage value found.");
        return currentStoneInfo;
      }

      if (currentStoneInfo &&
        currentStoneInfo.percentage === percentageValue &&
        line1.length === currentStoneInfo.line1.length &&
        line2.length === currentStoneInfo.line2.length &&
        line3.length === currentStoneInfo.line3.length &&
        line1.every((status, index) => status === currentStoneInfo.line1[index]) &&
        line2.every((status, index) => status === currentStoneInfo.line2[index]) &&
        line3.every((status, index) => status === currentStoneInfo.line3[index])
      )
        return currentStoneInfo;

      return {
        line1,
        line2,
        line3,
        percentage: percentageValue
      };
    })
  }, [ocrText]);

  const processFrame = useCallback(async () => {
    if (
      !fullSourceCanvasRef.current ||
      fullSourceCanvasRef.current.width === 0 ||
      fullSourceCanvasRef.current.height === 0 ||
      !displayCanvasRef.current ||
      !mediaStream?.active
    ) {
      console.log(
        "ProcessFrame: Aborting due to missing/invalid refs, zero-size fullSourceCanvas, or inactive stream.",
        {
          fullSourceCanvas: fullSourceCanvasRef.current,
          fullSourceCanvasWidth: fullSourceCanvasRef.current?.width,
          fullSourceCanvasHeight: fullSourceCanvasRef.current?.height,
          displayCanvas: displayCanvasRef.current,
          mediaStreamActive: mediaStream?.active,
        }
      );
      return;
    }

    const fullSourceCanvas = fullSourceCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    const displayCtx = displayCanvas.getContext('2d');
    const fullSourceCtx = fullSourceCanvas.getContext('2d', { willReadFrequently: true });

    if (!displayCtx || !fullSourceCtx) {
      console.log("ProcessFrame: Aborting due to missing canvas contexts");
      return;
    }

    try {
      displayCanvas.width = CROP_WIDTH;
      displayCanvas.height = CROP_HEIGHT;
      displayCtx.drawImage(
        fullSourceCanvas,
        CROP_X,
        CROP_Y,
        CROP_WIDTH,
        CROP_HEIGHT,
        0,
        0,
        CROP_WIDTH,
        CROP_HEIGHT
      );

      const parsedTargets = parseTargets(targets, fullSourceCanvas, fullSourceCtx);

      parsedTargets.forEach(target => {
        displayCtx.fillStyle = 'rgba(255, 255, 0, 0.7)'; // Default marker color
        if (target.isMatch) {
          displayCtx.fillStyle = target.isMatch ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
        }

        for (const offset of SPIRAL_OFFSETS_5X5) {
          const markerXOnFull = target.x + offset.dx;
          const markerYOnFull = target.y + offset.dy;
          const markerXOnDisplay = markerXOnFull - CROP_X;
          const markerYOnDisplay = markerYOnFull - CROP_Y;
          if (markerXOnDisplay >= 0 && markerYOnDisplay >= 0 && markerXOnDisplay < displayCanvas.width && markerYOnDisplay < displayCanvas.height) {
            if (markerXOnFull >= 0 && markerYOnFull >= 0 && markerXOnFull < fullSourceCanvas.width && markerYOnFull < fullSourceCanvas.height) {
              displayCtx.fillRect(markerXOnDisplay, markerYOnDisplay, 1, 1);
            }
          }
        }
      });

      setTargets(currentTargets => {
        if (
          parsedTargets.every(target => target.detectedStatus !== 'unknown' && target.isMatch) &&
          parsedTargets.some((target, i) => target.detectedStatus !== currentTargets[i].detectedStatus)
        ) {// Define the specific region for OCR
          setOcrText(undefined); // Corrected typo: Processsing -> Processing
          const ocrX = 1185;
          const ocrY = 310;
          const ocrWidth = 46;
          const ocrHeight = 27;

          // Perform OCR on the specified region of the fullSourceCanvas
          if (fullSourceCanvasRef.current) {
            const ocrCanvas = document.createElement('canvas');
            ocrCanvas.width = ocrWidth;
            ocrCanvas.height = ocrHeight;
            const ocrCtx = ocrCanvas.getContext('2d');

            if (ocrCtx) {
              ocrCtx.drawImage(
                fullSourceCanvasRef.current,
                ocrX, // source X
                ocrY, // source Y
                ocrWidth, // source width
                ocrHeight, // source height
                0, // destination X
                0, // destination Y
                ocrWidth, // destination width
                ocrHeight // destination height
              );

              if (tesseractWorkerRef.current && tesseractWorkerReady) {
                tesseractWorkerRef.current.recognize(ocrCanvas)
                  .then(({ data: { text } }) => {
                    setOcrText(text);
                    console.debug(`OCR Result: "${text}"`);
                  }).catch(err => {
                    console.error('OCR Error:', err);
                    setOcrText(undefined);
                  });
              } else {
                console.warn("OCR: Tesseract worker not ready or not initialized. Skipping OCR.");
                setOcrText(undefined);
              }
            } else {
              console.error("OCR: Could not get context from ocrCanvas.");
              setOcrText(undefined);
            }
          } else {
            console.warn("OCR: fullSourceCanvasRef.current is not available.");
            setOcrText(undefined);
          }

          setCapturedImageSrc(displayCanvas.toDataURL('image/png'));

          return parsedTargets;
        }

        return currentTargets;
      })

    } catch (error) {
      console.error("Error processing frame:", error);
      // Potentially stop automation or clear image if processing fails badly
      // setCapturedImageSrc(null); 
    }
  }, [
    mediaStream,
    fullSourceCanvasRef,
    displayCanvasRef,
    targets, // Added targets to the dependency array
    setTargets,
    setCapturedImageSrc,
    classifyPixelColor,
    // Constants are stable and don't need to be in deps if defined outside component scope
    // SPIRAL_OFFSETS_5X5, CROP_X, CROP_Y, CROP_WIDTH, CROP_HEIGHT 
  ]);

  const captureWithHiddenVideoInternal = useCallback(async (track: MediaStreamTrack, localFullSourceCanvas: HTMLCanvasElement) => {
    const video = document.createElement('video');
    Object.assign(video.style, { position: 'absolute', left: '-9999px', top: '-9999px' });
    video.muted = true; video.playsInline = true; document.body.appendChild(video);
    video.srcObject = new MediaStream([track]);
    try {
      await video.play();
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const check = () => video.videoWidth > 0 && video.videoHeight > 0 ? resolve() : attempts++ < 20 ? setTimeout(check, 100) : reject(new Error("Video timeout"));
        check();
      });
      localFullSourceCanvas.width = video.videoWidth;
      localFullSourceCanvas.height = video.videoHeight;
      const ctx = localFullSourceCanvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, localFullSourceCanvas.width, localFullSourceCanvas.height);
        processFrame(); // Corrected: No argument needed
      }
      else console.error("No context for hidden video's fullSourceCanvas");
    } catch (e) { console.error("Hidden video error:", e); }
    finally { video.pause(); video.srcObject = null; video.remove(); }
  }, [processFrame]);

  const captureAndProcess = useCallback(async (sourceTrack?: MediaStreamTrack) => {
    const track = sourceTrack || mediaStream?.getVideoTracks()[0];
    if (!displayCanvasRef.current || !track) {
      if (!track && isAutomating) {
        console.log("Stream lost, stopping automation (detected in captureAndProcess)");
        setIsAutomating(false);
      }
      return;
    }

    if (!fullSourceCanvasRef.current) {
      fullSourceCanvasRef.current = document.createElement('canvas');
    }
    const currentFullSourceCanvas = fullSourceCanvasRef.current;

    try {
      const IC = (window as any).ImageCapture;
      if (!IC) {
        await captureWithHiddenVideoInternal(track, currentFullSourceCanvas);
        return;
      }
      const imageCapture = new IC(track);
      const bitmap = await imageCapture.grabFrame();
      currentFullSourceCanvas.width = bitmap.width;
      currentFullSourceCanvas.height = bitmap.height;
      const ctx = currentFullSourceCanvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        processFrame(); // Corrected: No argument needed
      }
      else console.error("No context for ImageCapture's fullSourceCanvas");
    } catch (e) {
      console.warn("grabFrame failed, fallback:", e);
      await captureWithHiddenVideoInternal(track, currentFullSourceCanvas);
    }
  }, [mediaStream, processFrame, isAutomating, captureWithHiddenVideoInternal]);

  const startScreenShare = async () => {
    if (mediaStream?.active) {
      stopScreenShare(); // Stop existing stream before starting a new one
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setMediaStream(stream);
      if (stream.active && targets.length > 0) {
        setIsAutomating(true);
      }
      stream.getVideoTracks()[0].onended = () => {
        console.log('Screen share ended by user or browser');
        setMediaStream(null);
        setIsAutomating(false); // Directly set isAutomating to false
      };

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            videoRef.current.play();
            // Initialize fullSourceCanvas dimensions based on video - this is done by captureAndProcess now
            // const currentFullSourceCanvas = fullSourceCanvasRef.current;
            // if (currentFullSourceCanvas) {
            //   currentFullSourceCanvas.width = videoRef.current.videoWidth;
            //   currentFullSourceCanvas.height = videoRef.current.videoHeight;
            // }
            // Initial frame processing after metadata loaded
            if (stream.active) { // Ensure stream is still active
              captureAndProcess(); // Changed from processFrame()
            }
          } else {
            console.warn("onloadedmetadata: videoRef not fully ready or stream inactive.")
          }
        };
      }
    } catch (e) {
      console.error("Screen share error:", e);
      setMediaStream(null);
      setIsAutomating(false); // Directly set isAutomating to false
    }
  };

  useEffect(() => {
    if (isAutomating) {
      if (!mediaStream?.active) {
        console.log("Automation attempt while stream is not active or lost. Stopping.");
        setIsAutomating(false); // Directly set isAutomating to false
        return;
      }
      captureAndProcess();
      const intervalId = setInterval(() => {
        if (mediaStream?.active) {
          captureAndProcess();
        } else {
          console.log("Stream became inactive during automation interval. Stopping.");
          setIsAutomating(false); // Directly set isAutomating to false
        }
      }, 500);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isAutomating, mediaStream, captureAndProcess]);

  const stopScreenShare = () => {
    setIsAutomating(false); // Directly set isAutomating to false
    mediaStream?.getTracks().forEach(t => t.stop());
    setMediaStream(null);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full items-center"> {/* MODIFIED: className for full width and responsive padding */}
      <h1 className="text-3xl font-bold text-center">Stone Cutter</h1>
      <p className="text-sm text-muted-foreground text-center max-w-prose">
        This tool has only been tested in fullscreen and borderless mode at 1920x1080 (16:9) resolution.
        It will not work correctly with other resolutions or windowed modes, and may also be affected by certain color or brightness settings.
      </p>
      {/* Hidden video element for screen capture source */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <div className="grid sm:grid-cols-[max-content_max-content] gap-6 justify-center">
        <ControlsCard
          onStartScreenShare={startScreenShare}
          onStopScreenShare={stopScreenShare}
          isAutomating={isAutomating}
          mediaStreamActive={!!mediaStream?.active}
          showDebugInfo={showDebugInfo}
          setShowDebugInfo={setShowDebugInfo}
        />
        <SessionInfoCard
          mediaStreamActive={!!mediaStream?.active}
          targets={targets}
        />
      </div>

      <StoneStatus stoneState={stoneInfo} className='w-fit' />

      <canvas ref={displayCanvasRef} className="hidden" />
      {showDebugInfo && (
        <>
          <LiveFeedCard capturedImageSrc={capturedImageSrc} />
          <TargetOverviewCard targets={targets} className='h-fit w-fit' />
        </>
      )}
    </div>
  );
}
