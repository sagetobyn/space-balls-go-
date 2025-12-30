import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LevelSequenceV2 } from '../rules/LevelSequence'

interface GameState {
    currentLevel: number
    maxLevels: number
    state: 'playing' | 'won' | 'lost' | 'transition'
    actions: {
        startLevel: (level: number) => void
        completeLevel: () => void
        nextLevel: () => void
        failLevel: () => void
        resetLevel: () => void
        resetGame: () => void
    }
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            currentLevel: 1,
            maxLevels: LevelSequenceV2.length,
            state: 'playing',
            actions: {
                startLevel: (level) => set({ currentLevel: level, state: 'playing' }),
                completeLevel: () => set({ state: 'won' }),
                nextLevel: () => {
                    const { currentLevel, maxLevels } = get()
                    if (currentLevel < maxLevels) {
                        set({ currentLevel: currentLevel + 1, state: 'playing' })
                    } else {
                        set({ state: 'won' })
                    }
                },
                failLevel: () => set({ state: 'lost' }),
                resetLevel: () => set({ state: 'playing' }),
                resetGame: () => set({ currentLevel: 1, state: 'playing' })
            }
        }),
        {
            name: 'one-rule-storage',
            partialize: (state) => ({ currentLevel: state.currentLevel }), // Only persist level
        }
    )
)
