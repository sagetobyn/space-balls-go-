import React from 'react';
import { Button } from '../ui/Button';

interface AchievementsProps {
    onBack: () => void;
}

export const Achievements: React.FC<AchievementsProps> = ({ onBack }) => {
    // Mock Data
    const achievements = [
        { id: 1, title: 'First Steps', desc: 'Complete Level 1', locked: false, icon: '🌟' },
        { id: 2, title: 'Speedster', desc: 'Complete a level in under 5s', locked: false, icon: '⚡' },
        { id: 3, title: 'Survivor', desc: 'Die 50 times', locked: true, icon: '💀' },
        { id: 4, title: 'Void Walker', desc: 'Complete Level 25', locked: true, icon: '🌌' },
    ];

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in bg-black/90 backdrop-blur-xl">
            <div className="w-full max-w-2xl p-8">
                <header className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-bold tracking-[0.2em] text-white/90 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        Achievements
                    </h2>
                    <Button variant="icon" onClick={onBack}>✕</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((ach) => (
                        <div
                            key={ach.id}
                            className={`
                                relative p-6 rounded-xl border transition-all duration-300 group
                                ${ach.locked
                                    ? 'bg-white/5 border-white/5 opacity-50'
                                    : 'bg-cyan-900/10 border-cyan-500/30 hover:bg-cyan-900/20 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-2xl
                                    ${ach.locked ? 'bg-white/5 grayscale' : 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg'}
                                `}>
                                    {ach.icon}
                                </div>
                                <div>
                                    <h3 className={`font-bold uppercase tracking-wider text-sm ${ach.locked ? 'text-white/30' : 'text-cyan-300'}`}>
                                        {ach.title}
                                    </h3>
                                    <p className="text-xs text-white/40 mt-1">{ach.desc}</p>
                                </div>
                            </div>

                            {ach.locked && (
                                <div className="absolute top-4 right-4 text-white/20">
                                    🔒
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
