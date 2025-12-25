
import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import HandOverlay from './components/HandOverlay';
import { useHandTracking } from './hooks/useHandTracking';
import { TreeState } from './types';
import { THEME } from './constants';

const App: React.FC = () => {
  const { videoRef, handData, isLoading, startCamera } = useHandTracking();
  const [treeState, setTreeState] = useState<TreeState>(TreeState.EXPLODE);
  const [rotationY, setRotationY] = useState(0);
  const [wish, setWish] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Only allow hand tracking to change state if not currently in a special "Sending" sequence
    if (handData && !isSending && !showResult) {
      if (handData.isPinching) {
        setTreeState(TreeState.TREE);
      } else if (handData.isOpen) {
        setTreeState(TreeState.EXPLODE);
      }
      const targetRotation = (handData.x - 0.5) * Math.PI * 2;
      setRotationY(prev => prev + (targetRotation - prev) * 0.1);
    }
  }, [handData, isSending, showResult]);

  const handleSend = () => {
    if (!wish.trim() || isSending) return;

    setIsSending(true);
    setShowResult(false);
    setTreeState(TreeState.SENDING);

    // Sequence: 3 seconds of spiral energy, then explosion and result
    setTimeout(() => {
      setTreeState(TreeState.EXPLODE);
      setIsSending(false);
      setShowResult(true);
    }, 3200);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setWish("");
    setTreeState(TreeState.EXPLODE);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: THEME.bg }}>
      {/* UI Layer: Title */}
      <div className="absolute top-12 left-12 z-10 pointer-events-none">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-emerald-500 to-green-700 tracking-tighter drop-shadow-[0_0_25px_rgba(16,185,129,0.4)] uppercase">
          Magic Wishing Tree
        </h1>
        <p className="text-emerald-300/60 text-lg font-light tracking-[0.5em] mt-2 flex items-center gap-4">
          TECH CHRISTMAS <span className="h-px w-24 bg-emerald-500/40"></span>
        </p>
      </div>

      {/* How to interact box */}
      <div className="absolute bottom-12 left-12 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-5 w-64 shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all">
          <h2 className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            How to interact
          </h2>
          
          <div className="space-y-4">
            <section>
              <h3 className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-1.5">Mouse Control</h3>
              <ul className="text-emerald-100/60 text-[10px] space-y-1 font-medium">
                <li className="flex justify-between"><span>Orbit</span> <span className="text-emerald-400/80">Left Click</span></li>
                <li className="flex justify-between"><span>Zoom</span> <span className="text-emerald-400/80">Scroll</span></li>
              </ul>
            </section>

            <section>
              <h3 className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-1.5">AI Gesture</h3>
              <ul className="text-emerald-100/60 text-[10px] space-y-1 font-medium">
                <li className="flex justify-between"><span>Assemble</span> <span className="text-emerald-400/80">Pinch/Grab</span></li>
                <li className="flex justify-between"><span>Explode</span> <span className="text-emerald-400/80">Open Hand</span></li>
                <li className="flex justify-between"><span>Rotate</span> <span className="text-emerald-400/80">Move Hand</span></li>
              </ul>
            </section>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
             <span className="text-[10px] text-emerald-500/40 uppercase font-mono">Status: {isSending ? 'Transmitting' : 'Connected'}</span>
             <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isSending ? 'bg-emerald-400 shadow-[0_0_12px_#00ff41] animate-ping' : treeState === TreeState.TREE ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-gray-700'}`}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Wish Box */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-6 transition-all duration-700 ${showResult ? 'opacity-0 pointer-events-none scale-90 translate-y-8' : 'opacity-100 pointer-events-auto'}`}>
        <div className="relative group p-[2px] rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/40 to-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="bg-black/80 backdrop-blur-2xl rounded-[14px] flex items-center p-2 overflow-hidden border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
            <input 
              type="text"
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              disabled={isSending}
              placeholder="Enter your Christmas wish..."
              className="flex-1 bg-transparent outline-none py-4 px-6 text-emerald-50 text-lg font-light tracking-widest placeholder:text-emerald-800 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!wish.trim() || isSending}
              className={`px-8 py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all duration-300 border ${
                wish.trim() && !isSending 
                ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer' 
                : 'bg-emerald-950/50 text-emerald-900 border-emerald-900/50 cursor-not-allowed opacity-50'
              }`}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className="absolute -bottom-6 left-0 w-full text-[10px] text-center text-emerald-500/40 uppercase tracking-[0.4em] font-medium">
             Quantum Encryption: Enabled • System Ready
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-emerald-950/20 border border-emerald-500/30 p-16 rounded-[40px] backdrop-blur-3xl shadow-[0_0_150px_rgba(16,185,129,0.4)] text-center max-w-2xl transform animate-in zoom-in slide-in-from-bottom-12 duration-1000">
              <div className="text-emerald-400 text-6xl mb-8 drop-shadow-[0_0_20px_rgba(16,185,129,0.9)] animate-bounce">🎄</div>
              <div className="space-y-4 mb-12">
                <p className="text-emerald-400/80 text-xl font-medium tracking-[0.2em] uppercase">Oops! No gift, but</p>
                <h2 className="text-white text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  Merry <br/> Christmas!
                </h2>
              </div>
              <button 
                onClick={handlePlayAgain}
                className="w-full py-5 bg-emerald-500 text-black text-lg font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 group"
              >
                <span className="group-hover:tracking-[0.4em] transition-all">Play Again</span>
              </button>
              <p className="mt-8 text-[10px] text-emerald-500/40 uppercase tracking-[0.5em] font-mono">
                System Reset Sequence: Available
              </p>
           </div>
        </div>
      )}

      {/* 3D Scene */}
      <div className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-1000 ${showResult ? 'blur-md grayscale-[0.3]' : ''}`}>
        <Scene treeState={treeState} rotationY={rotationY} />
      </div>

      {/* AI Hand Tracking HUD */}
      <HandOverlay 
        videoRef={videoRef} 
        isLoading={isLoading} 
        onStart={startCamera} 
        handX={handData?.x ?? 0.5}
        handY={handData?.y ?? 0.5}
      />

      {/* Aesthetic Overlays */}
      <div className="fixed inset-0 pointer-events-none border-[30px] border-emerald-900/10 mix-blend-overlay"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
    </div>
  );
};

export default App;
