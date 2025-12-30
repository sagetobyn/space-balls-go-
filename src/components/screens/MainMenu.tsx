import React from 'react';
import { Button } from '../ui/Button';

interface MainMenuProps {
    onStart: () => void;
    onSettings: () => void;
    onAchievements: () => void;
    onHowToPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onSettings, onAchievements, onHowToPlay }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in">
            {/* Title Section */}
            <div className="text-center mb-16 animate-float">
                <h1 className="text-6xl md:text-8xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-900 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    CONSTELLATION
                </h1>
                <p className="mt-4 text-cyan-500/60 uppercase tracking-[0.5em] text-sm md:text-base font-medium">
                    Journey Through The Void
                </p>
            </div>

            {/* Menu Buttons */}
            <div className="space-y-4 flex flex-col items-center">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onStart}
                    className="animate-scale-in [animation-delay:200ms]"
                >
                    <span className="mr-3">▶</span> Start
                </Button>

                <Button
                    variant="secondary"
                    onClick={onHowToPlay}
                    className="animate-scale-in [animation-delay:300ms]"
                >
                    <span className="mr-3">?</span> How to Play
                </Button>

                <Button
                    variant="secondary"
                    onClick={onSettings}
                    className="animate-scale-in [animation-delay:400ms]"
                >
                    <span className="mr-3">⚙</span> Settings
                </Button>

                <Button
                    variant="secondary"
                    onClick={onAchievements}
                    className="animate-scale-in [animation-delay:500ms]"
                >
                    <span className="mr-3">🏆</span> Achievements
                </Button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-white/20 text-xs tracking-widest uppercase">
                v1.0.0
            </div>
        </div>
    );
};
