import React from 'react';

interface LevelSelectProps {
    onSelectLevel: (level: number) => void;
    onBack: () => void;
    completedLevels: number[]; // Array of completed level numbers
}

export const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel, onBack, completedLevels }) => {
    // const totalLevels = 25; 
    const levels = Array.from({ length: 25 }, (_, i) => i + 1);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in bg-black/50 backdrop-blur-sm">
            <header className="absolute top-8 w-full text-center">
                <h2 className="text-3xl font-bold tracking-[0.3em] text-white/90 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    Constellation
                </h2>
                <p className="text-xs tracking-[0.2em] text-cyan-400 mt-2">JOURNEY THROUGH THE VOID</p>
            </header>

            <button
                onClick={onBack}
                className="absolute top-8 left-8 w-10 h-10 border border-white/20 rounded hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors"
                aria-label="Back"
            >
                ←
            </button>

            <div className="grid grid-cols-5 gap-4 md:gap-6 mt-16 max-w-4xl px-4">
                {levels.map((level) => {
                    const isCompleted = completedLevels.includes(level);
                    // For now, assume all unlocked or logic elsewhere. 
                    // Let's assume level 1 is 'Pulse' blue active style from screenshot.
                    const isActive = level === 1; // Logic placeholder

                    let bgClass = "bg-transparent border border-white/10 text-white/50 hover:border-cyan-500/50 hover:text-cyan-400";
                    if (isActive) {
                        bgClass = "bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-110";
                    } else if (isCompleted) {
                        bgClass = "bg-cyan-900/20 border-cyan-500/30 text-cyan-300";
                    }

                    return (
                        <button
                            key={level}
                            onClick={() => onSelectLevel(level)}
                            className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-sm md:text-lg transition-all duration-300 ${bgClass}`}
                        >
                            {level}
                        </button>
                    )
                })}
            </div>

            <div className="absolute bottom-8 w-full px-16">
                {/* Progress Bar Placeholder */}
                <div className="flex justify-between text-xs text-white/30 tracking-widest uppercase mb-2">
                    <span>Progress</span>
                    <span>0/50</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-0" />
                </div>
            </div>
        </div>
    );
};
