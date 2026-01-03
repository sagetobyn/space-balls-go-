import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LevelSequenceV2 } from '../rules/LevelSequence'

interface LevelData {
    stars: number
    completed: boolean
    highScore?: number
}

interface SettingsState {
    masterVolume: number
    sfxVolume: number
    particlesEnabled: boolean
    bloomEnabled: boolean
    hapticsEnabled: boolean
    joystickMode: 'right' | 'left' | 'hidden'
    speedModifier: 0.7 | 1.0 | 1.3 // [NEW] Player Speed (Slow/Normal/Fast)
}

interface GameState {
    currentLevel: number
    maxLevels: number
    state: 'playing' | 'won' | 'lost' | 'transition'
    totalFailures: number
    levelFailures: number
    levelProgress: Record<number, LevelData>
    settings: SettingsState // [NEW]
    actions: {
        startLevel: (level: number) => void
        completeLevel: () => void
        completeLevelWithRating: (stars: number) => void
        nextLevel: () => void
        failLevel: () => void
        resetLevel: () => void
        resetGame: () => void
        updateSettings: (settings: Partial<SettingsState>) => void // [NEW]
    }
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            currentLevel: 1,
            maxLevels: LevelSequenceV2.length,
            state: 'playing',
            totalFailures: 0,
            levelFailures: 0,
            levelProgress: {}, // [PRODUCTION] Start with all levels locked (level 1 always accessible)
            settings: {
                masterVolume: 1.0,
                sfxVolume: 1.0,
                particlesEnabled: true,
                bloomEnabled: true,
                hapticsEnabled: true,
                joystickMode: 'hidden', // Default hidden per user request
                speedModifier: 1.0 // Default Normal
            },
            actions: {
                startLevel: (level) => set({ currentLevel: level, state: 'playing', levelFailures: 0 }),
                completeLevel: () => set({ state: 'won' }),
                completeLevelWithRating: (stars) => set((state) => {
                    const currentData = state.levelProgress[state.currentLevel] || { stars: 0, completed: false }
                    const newStars = Math.max(currentData.stars, stars)
                    return {
                        levelProgress: {
                            ...state.levelProgress,
                            [state.currentLevel]: { stars: newStars, completed: true }
                        }
                    }
                }),
                nextLevel: () => {
                    const { currentLevel, maxLevels } = get()
                    if (currentLevel < maxLevels) {
                        set({ currentLevel: currentLevel + 1, state: 'playing', levelFailures: 0 })
                    } else {
                        set({ state: 'won' })
                    }
                },
                failLevel: () => set((state) => ({
                    state: 'playing',
                    totalFailures: state.totalFailures + 1,
                    levelFailures: state.levelFailures + 1
                })),
                resetLevel: () => set({ state: 'playing' }),
                resetGame: () => set({ currentLevel: 1, state: 'playing', totalFailures: 0, levelFailures: 0, levelProgress: {} }),
                updateSettings: (newSettings) => {
                    set((state) => ({
                        settings: { ...state.settings, ...newSettings }
                    }))

                    // [FIX] Direct Drive Audio
                    if (newSettings.masterVolume !== undefined) {
                        const { MusicManager } = require('../core/MusicManager')
                        MusicManager.setMasterVolume(newSettings.masterVolume)
                    }
                }
            }
        }),
        {
            name: 'space-balls-storage-v3', // [PRODUCTION] Clean storage for release
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                currentLevel: state.currentLevel,
                totalFailures: state.totalFailures,
                levelProgress: state.levelProgress,
                settings: state.settings // [NEW]
            }),
        }
    )
)
