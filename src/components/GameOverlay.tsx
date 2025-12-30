import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';

interface GameOverlayProps {
    level: number;
    levelName?: string; // e.g. "Input Delayed"
    levelInstruction?: string; // e.g. "Movement reacts with a delay"
    onPause: () => void;
    onReset: () => void;
    onExit: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
    level,
    levelName = "Unknown Sector",
    levelInstruction = "Survive",
    onPause,
    onReset,
    onExit
}) => {
    // animate instruction in
    const [showInstruction, setShowInstruction] = useState(true);

    useEffect(() => {
        // Reset animation on level change
        setShowInstruction(true);
        const timer = setTimeout(() => setShowInstruction(false), 3000); // Fade out main instruction after 3s? 
        // Actually screenshot shows it persistent but subtle. Let's keep it.
        return () => clearTimeout(timer);
    }, [level]);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full z-10">
                <Button
                    variant="secondary"
                    size="sm"
                    className="pointer-events-auto backdrop-blur-md bg-white/5 border-white/10 !px-4 !py-2 !min-w-0"
                    onClick={onPause}
                >
                    MENU
                </Button>

                <div className="flex flex-col items-center pt-2">
                    <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-500">
                        {level}
                    </h1>
                    <div className={`flex flex-col items-center transition-opacity duration-1000 ${showInstruction ? 'opacity-100' : 'opacity-50'}`}>
                        <h2 className="text-cyan-400 font-bold uppercase tracking-[0.1em] text-sm mt-1 animate-pulse">
                            {levelName}
                        </h2>
                        <p className="text-white/50 text-xs italic tracking-wide mt-1">
                            {levelInstruction}
                        </p>
                    </div>
                </div>

                <Button
                    variant="primary" // Red/Primary style for Reset as 'Action' or 'Danger'
                    size="sm"
                    className="pointer-events-auto !bg-red-500/20 !border-red-500/50 !text-red-400 hover:!bg-red-500/30 !px-4 !py-2 !min-w-0"
                    onClick={onReset}
                >
                    RESET
                </Button>
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-end items-end w-full z-10 pb-4">
                <button
                    onClick={onExit}
                    className="pointer-events-auto w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                >
                    <span className="text-[10px] uppercase font-bold tracking-widest">EXIT</span>
                </button>
            </div>
        </div>
    );
};
