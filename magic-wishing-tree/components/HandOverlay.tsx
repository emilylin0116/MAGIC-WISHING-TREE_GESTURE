
import React from 'react';

interface HandOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  onStart: () => void;
  handX: number;
  handY: number;
}

const HandOverlay: React.FC<HandOverlayProps> = ({ videoRef, isLoading, onStart, handX, handY }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative w-48 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl bg-black/50 group backdrop-blur-md">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
        />
        
        {/* Cursor tracking point */}
        <div 
          className="absolute w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] border border-white/50 pointer-events-none transition-transform duration-75 ease-out"
          style={{ 
            left: `${handX * 100}%`, 
            top: `${handY * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />

        {!videoRef.current?.srcObject && !isLoading && (
          <button
            onClick={onStart}
            className="absolute inset-0 flex items-center justify-center bg-black/60 hover:bg-black/40 transition-colors text-emerald-200 text-sm font-bold uppercase tracking-widest"
          >
            Start AI Camera
          </button>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-emerald-400/60 text-right uppercase tracking-tighter">
        AI Gesture Control: Active
      </div>
    </div>
  );
};

export default HandOverlay;
