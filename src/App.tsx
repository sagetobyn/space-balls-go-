import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/screens/MainMenu';
import { LevelSelect } from './components/screens/LevelSelect';
import { PauseMenu } from './components/screens/PauseMenu';
import { Settings } from './components/screens/Settings';
import { Achievements } from './components/screens/Achievements';
import { HowToPlay } from './components/screens/HowToPlay';
import { GameOverlay } from './components/GameOverlay';
import { ruleManager } from './rules/RuleManager';
import { LevelSequenceV2 } from './rules/LevelSequence';

type ScreenState = 'menu' | 'levels' | 'game' | 'pause' | 'settings' | 'achievements' | 'how-to-play';

function App() {
    const [screen, setScreen] = useState<ScreenState>('menu');
    const [previousScreen, setPreviousScreen] = useState<ScreenState>('menu'); // For Back navigation
    const [currentLevel, setCurrentLevel] = useState(1);
    const [completedLevels, setCompletedLevels] = useState<number[]>([1]); // Mock data

    // --- Actions ---

    const navigate = (to: ScreenState) => {
        if (screen !== to) {
            setPreviousScreen(screen); // Track where we came from
            setScreen(to);
        }
    }

    // Special case for 'Back' which might go to different places depending on context
    const goBack = () => {
        // If we came from pause to settings, go back to pause.
        // If we came from menu to settings, go back to menu.
        if (screen === 'settings') {
            if (previousScreen === 'pause') setScreen('pause');
            else setScreen('menu');
        } else {
            setScreen('menu');
        }
    }

    const startGame = (level: number = 1) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    const handleLevelComplete = () => {
        // Simple progression
        if (!completedLevels.includes(currentLevel)) {
            setCompletedLevels([...completedLevels, currentLevel]);
        }

        // Auto-advance
        if (currentLevel < 50) {
            setCurrentLevel(prev => prev + 1);
        } else {
            // Game Finished logic (Back to menu for now)
            setScreen('menu');
        }
    };

    // --- Derived Data ---
    const currentRuleId = LevelSequenceV2[currentLevel - 1];
    const currentRule = ruleManager.getContent(currentRuleId);

    return (
        <div className="w-full h-full bg-[#0a0a0a] overflow-hidden font-sans select-none">
            {/* Background Starfield Layer (Global) */}
            <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
                {/* We could use particles here or a CSS effect. The CSS radial gradient in index.css does the heavy lifting. */}
            </div>

            {/* Screen Router */}
            {screen === 'menu' && (
                <MainMenu
                    onStart={() => startGame(1)}
                    onSettings={() => navigate('settings')}
                    onAchievements={() => navigate('achievements')}
                    onHowToPlay={() => navigate('how-to-play')}
                />
            )}

            {screen === 'levels' && (
                <LevelSelect
                    completedLevels={completedLevels}
                    onSelectLevel={(level) => startGame(level)}
                    onBack={() => setScreen('menu')}
                />
            )}

            {screen === 'settings' && (
                <Settings onBack={goBack} />
            )}

            {screen === 'achievements' && (
                <Achievements onBack={() => setScreen('menu')} />
            )}

            {screen === 'how-to-play' && (
                <HowToPlay onBack={() => setScreen('menu')} />
            )}

            {(screen === 'game' || screen === 'pause') && (
                <>
                    <GameCanvas
                        level={currentLevel}
                        paused={screen === 'pause'}
                        onWin={handleLevelComplete}
                    />

                    {screen === 'game' && (
                        <GameOverlay
                            level={currentLevel}
                            levelName={currentRule?.name}
                            levelInstruction={currentRule?.description}
                            onPause={() => setScreen('pause')}
                            onReset={() => {
                                // Force remount or special reset?
                                // Ideally pass a 'key' to GameCanvas or toggle a reset flag.
                                // Quickest way: Retriggers useEffect in GameCanvas via prop or remount.
                                // Let's simplify: Just re-set level or use key.
                                const temp = currentLevel;
                                setCurrentLevel(0); // Hack to force unmount/remount if needed, or better:
                                setTimeout(() => setCurrentLevel(temp), 0);
                            }}
                            onExit={() => setScreen('menu')}
                        />
                    )}

                    {screen === 'pause' && (
                        <PauseMenu
                            onResume={() => setScreen('game')}
                            onRestart={() => {
                                setScreen('game');
                                // Reset logic
                                const temp = currentLevel;
                                setCurrentLevel(0);
                                setTimeout(() => setCurrentLevel(temp), 0);
                            }}
                            onSettings={() => navigate('settings')}
                            onMainMenu={() => setScreen('menu')}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default App
