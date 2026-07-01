"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VerificationStage =
  | "idle"
  | "requesting-permission"
  | "model-loading"
  | "capturing"
  | "comparing"
  | "done"
  | "skipped";

export interface VerificationCaptureResult {
  latitude: number | null;
  longitude: number | null;
  photo: Blob | null;
  faceEmbeddingJson: string | null;
  faceMatch: boolean | null;
}

const MODEL_URL = "/models";
const MODEL_LOAD_TIMEOUT_MS = 5000;
const GEOLOCATION_TIMEOUT_MS = 5000;
// @vladmandic/face-api's documented default threshold for the same-person euclidean distance cutoff.
const FACE_MATCH_DISTANCE_THRESHOLD = 0.6;

let modelLoadPromise: Promise<void> | null = null;

function loadFaceApiModels(): Promise<void> {
  modelLoadPromise ??= import("@vladmandic/face-api").then(async (faceapi) => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  });
  return modelLoadPromise;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      }
    );
  });
}

function captureLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 }
    );
  });
}

/**
 * Captures one still frame from the front camera. Every getUserMedia failure mode (permission
 * denied, no device, camera busy/unsupported, aborted) resolves to null instead of throwing, per
 * NFR-Availability — a denied/missing camera must never block clock-in.
 */
async function captureCameraFrame(): Promise<{ blob: Blob; canvas: HTMLCanvasElement } | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
  } catch {
    return null;
  }

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.srcObject = stream;
    await video.play().catch(() => undefined);
    // Brief warm-up so auto-exposure/focus settles before the still frame is grabbed.
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
    );
    return blob ? { blob, canvas } : null;
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

const EMPTY_RESULT: VerificationCaptureResult = {
  latitude: null,
  longitude: null,
  photo: null,
  faceEmbeddingJson: null,
  faceMatch: null,
};

/**
 * Orchestrates one check-in attempt's best-effort geolocation + camera capture + on-device
 * face-api.js enrollment/comparison. Every signal is optional: permission denial, missing
 * hardware, or a slow model load resolves to a partial/empty result, never a thrown error.
 *
 * The captured frame and face descriptor only ever exist as local values passed through the
 * `capture()` promise — never assigned to component state/props, never base64-encoded for a
 * preview, never written to browser storage — so they cannot leak via React DevTools or
 * state-serializing error reporters, and are eligible for GC as soon as the caller is done.
 */
export function useCheckInVerification() {
  const [stage, setStage] = useState<VerificationStage>("idle");
  const runningRef = useRef(false);

  // Start the model bundle downloading as soon as the hook mounts, without blocking render.
  useEffect(() => {
    void loadFaceApiModels();
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
  }, []);

  /**
   * @param storedFaceEmbeddingJson Previously enrolled descriptor for this employee, or
   *   null/undefined if this is the first-time enrollment capture.
   */
  const capture = useCallback(
    async (storedFaceEmbeddingJson?: string | null): Promise<VerificationCaptureResult> => {
      if (runningRef.current) return EMPTY_RESULT;
      runningRef.current = true;

      try {
        setStage("requesting-permission");
        const [location, captured] = await Promise.all([captureLocation(), captureCameraFrame()]);

        if (!captured) {
          setStage("skipped");
          return {
            ...EMPTY_RESULT,
            latitude: location?.latitude ?? null,
            longitude: location?.longitude ?? null,
          };
        }

        setStage("model-loading");
        const modelsReady = await withTimeout(loadFaceApiModels(), MODEL_LOAD_TIMEOUT_MS);
        if (modelsReady === null) {
          setStage("skipped");
          return {
            ...EMPTY_RESULT,
            latitude: location?.latitude ?? null,
            longitude: location?.longitude ?? null,
            photo: captured.blob,
          };
        }

        setStage(storedFaceEmbeddingJson ? "comparing" : "capturing");
        const faceapi = await import("@vladmandic/face-api");
        const detection = await faceapi
          .detectSingleFace(captured.canvas, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setStage("skipped");
          return {
            ...EMPTY_RESULT,
            latitude: location?.latitude ?? null,
            longitude: location?.longitude ?? null,
            photo: captured.blob,
          };
        }

        if (!storedFaceEmbeddingJson) {
          setStage("done");
          return {
            latitude: location?.latitude ?? null,
            longitude: location?.longitude ?? null,
            photo: captured.blob,
            faceEmbeddingJson: JSON.stringify(Array.from(detection.descriptor)),
            faceMatch: null,
          };
        }

        const storedDescriptor = new Float32Array(JSON.parse(storedFaceEmbeddingJson) as number[]);
        const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
        setStage("done");
        return {
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          photo: captured.blob,
          faceEmbeddingJson: null,
          faceMatch: distance <= FACE_MATCH_DISTANCE_THRESHOLD,
        };
      } catch {
        setStage("skipped");
        return EMPTY_RESULT;
      } finally {
        runningRef.current = false;
      }
    },
    []
  );

  return { stage, capture, reset };
}

/** Converts a captured frame to base64 only at the point of building the clock-in request body. */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
