import React from 'react';
import { Button } from '../ui/Button';

interface PauseMenuProps {
    onResume: () => void;
    onRestart: () => void;
    onSettings: () => void;
    onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onSettings, onMainMenu }) => {
    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col items-center gap-6">
                <h2 className="text-4xl font-bold tracking-[0.3em] text-white/90 mb-8 uppercase">Paused</h2>

                <Button variant="secondary" className="w-64" onClick={onResume}>
                    <span className="mr-3">▶</span> Resume
                </Button>

                <Button variant="secondary" className="w-64" onClick={onRestart}>
                    <span className="mr-3">⟳</span> Restart Level
                </Button>

                <Button variant="secondary" className="w-64" onClick={onSettings}>
                    <span className="mr-3">⚙</span> Settings
                </Button>

                <Button variant="secondary" className="w-64" onClick={onMainMenu}>
                    <span className="mr-3">🏠</span> Main Menu
                </Button>
            </div>
        </div>
    );
};
