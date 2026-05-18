// MediaPipe Hands loader. Script tags are added to index.html via root head links.
// We use the global `Hands` and `Camera` injected by the CDN scripts.
declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
  }
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandsResult {
  multiHandLandmarks: HandLandmark[][];
}

let loadPromise: Promise<void> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export function loadMediaPipe(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
  })();
  return loadPromise;
}
