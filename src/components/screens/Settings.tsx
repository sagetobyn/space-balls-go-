import React from 'react';
import { Button } from '../ui/Button';

interface SettingsProps {
    onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in bg-black/80 backdrop-blur-xl">
            <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                <h2 className="text-3xl font-bold tracking-[0.2em] text-white/90 uppercase text-center mb-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    Settings
                </h2>

                <div className="space-y-8">
                    {/* Volume Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs uppercase tracking-widest text-cyan-400">
                            <span>Master Volume</span>
                            <span>80%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
                            <div className="h-full bg-cyan-500 w-[80%] group-hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>
                    </div>

                    {/* SFX Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs uppercase tracking-widest text-cyan-400">
                            <span>SFX</span>
                            <span>100%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
                            <div className="h-full bg-cyan-500 w-full group-hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                        <span className="text-sm font-bold tracking-wider text-white/70">PARTICLES</span>
                        <div className="w-12 h-6 bg-cyan-500/20 rounded-full border border-cyan-500/50 relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-b border-white/5">
                        <span className="text-sm font-bold tracking-wider text-white/70">HAPTICS</span>
                        <div className="w-12 h-6 bg-cyan-500/20 rounded-full border border-cyan-500/50 relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Button variant="secondary" onClick={onBack} className="w-full">
                        Back
                    </Button>
                </div>
            </div>
        </div>
    );
};
