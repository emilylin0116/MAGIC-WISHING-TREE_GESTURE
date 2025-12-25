
import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { HandData } from '../types';

export const useHandTracking = () => {
  const [handData, setHandData] = useState<HandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();

  const setupMediaPipe = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      landmarkerRef.current = landmarker;
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize MediaPipe:", error);
    }
  }, []);

  const detect = useCallback(() => {
    if (
      videoRef.current && 
      videoRef.current.readyState === 4 && 
      landmarkerRef.current
    ) {
      const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
      );

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        // Index tip (8) and Thumb tip (4)
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) + 
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // All fingertips comparison to palm for "isOpen"
        // Simply: if distance is small, it's a pinch/grab
        const isPinching = distance < 0.05;
        
        // Finger extension check (Simplified)
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const wrist = landmarks[0];
        const isOpen = middleTip.y < wrist.y && ringTip.y < wrist.y && !isPinching;

        setHandData({
          x: 1 - landmarks[9].x, // Mirror and use center of hand
          y: landmarks[9].y,
          isPinching,
          isOpen,
          rawLandmarks: landmarks
        });
      } else {
        setHandData(null);
      }
    }
    requestRef.current = requestAnimationFrame(detect);
  }, []);

  useEffect(() => {
    setupMediaPipe();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [setupMediaPipe]);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        detect();
      };
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  return { videoRef, handData, isLoading, startCamera };
};
