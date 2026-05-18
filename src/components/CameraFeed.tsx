import { useEffect, useRef, useState } from "react";
import { loadMediaPipe, type HandsResult } from "@/lib/mediapipe";

export type DetectionStatus = "no-hands" | "detecting" | "processing";

interface Props {
  onStatusChange?: (s: DetectionStatus) => void;
  onHandsDetected?: (handCount: number) => void;
}

// Hand skeleton connections from MediaPipe Hands
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function CameraFeed({ onStatusChange, onHandsDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const statusRef = useRef<DetectionStatus>("no-hands");

  useEffect(() => {
    let cancelled = false;
    let hands: any;
    let camera: any;
    let stream: MediaStream | null = null;

    const setStatus = (s: DetectionStatus) => {
      if (statusRef.current !== s) {
        statusRef.current = s;
        onStatusChange?.(s);
      }
    };

    const init = async () => {
      try {
        await loadMediaPipe();
        if (cancelled) return;

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        const HandsCtor = window.Hands;
        const CameraCtor = window.Camera;
        if (!HandsCtor || !CameraCtor) throw new Error("MediaPipe failed to load");

        hands = new HandsCtor({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: HandsResult) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const hCount = results.multiHandLandmarks?.length ?? 0;
          onHandsDetected?.(hCount);
          if (hCount === 0) setStatus("no-hands");
          else setStatus("detecting");

          if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
              // connections
              ctx.strokeStyle = "rgba(13, 148, 136, 0.85)";
              ctx.lineWidth = 3;
              for (const [a, b] of CONNECTIONS) {
                const la = landmarks[a];
                const lb = landmarks[b];
                ctx.beginPath();
                ctx.moveTo(la.x * canvas.width, la.y * canvas.height);
                ctx.lineTo(lb.x * canvas.width, lb.y * canvas.height);
                ctx.stroke();
              }
              // points
              ctx.fillStyle = "rgba(224, 242, 254, 0.95)";
              for (const lm of landmarks) {
                ctx.beginPath();
                ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        });

        camera = new CameraCtor(video, {
          onFrame: async () => {
            await hands.send({ image: video });
          },
          width: 640,
          height: 480,
        });
        camera.start();
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Could not access camera");
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      try { camera?.stop?.(); } catch {}
      try { hands?.close?.(); } catch {}
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onStatusChange, onHandsDetected]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-foreground/95 shadow-lg">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
      />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/90 text-sm">
          Loading camera & hand tracking…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center text-primary-foreground/90 text-center p-6">
          <p className="font-medium">Camera unavailable</p>
          <p className="text-xs opacity-80">{error}</p>
          <p className="text-xs opacity-80">Enable Demo Mode to preview the app.</p>
        </div>
      )}
    </div>
  );
}
