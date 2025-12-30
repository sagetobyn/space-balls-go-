import React from 'react';
import { Button } from '../ui/Button';

interface HowToPlayProps {
    onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in bg-black/90 backdrop-blur-xl">
            <div className="w-full max-w-4xl p-8 flex flex-col items-center">
                <h2 className="text-4xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 uppercase mb-16">
                    How To Play
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full mb-16">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-32 h-32 rounded-full bg-black border border-cyan-500/30 relative flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                            {/* Abstract visual of finger dragging */}
                            <div className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-bounce" />
                            <div className="absolute w-20 h-20 border-2 border-white/10 rounded-full animate-ping" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2 uppercase tracking-widest">Controls</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Drag anywhere on screen to move the <span className="text-cyan-300 font-bold">Cyan Dot</span>.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-32 h-32 rounded-full bg-black border border-red-500/30 relative flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                            <div className="absolute w-8 h-8 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-red-500 mb-2 uppercase tracking-widest">Avoid</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Avoid the <span className="text-red-400 font-bold">Red Obstacles</span>. Contact resets the level.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-32 h-32 rounded-full bg-black border border-fuchsia-500/30 relative flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(217,70,239,0.1)]">
                            <div className="absolute w-12 h-12 rounded-full bg-fuchsia-500/20 border-2 border-fuchsia-500 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-fuchsia-400 mb-2 uppercase tracking-widest">Goal</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Reach the <span className="text-fuchsia-300 font-bold">Magenta Zone</span> to advance.
                            </p>
                        </div>
                    </div>
                </div>

                <Button variant="primary" size="lg" onClick={onBack}>
                    Got it
                </Button>
            </div>
        </div>
    );
};
