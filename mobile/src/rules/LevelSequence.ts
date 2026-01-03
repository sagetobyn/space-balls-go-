import { Vector2 } from '../core/Vector2'

export interface ObstacleConfig {
    type: 'grid' | 'orbit' | 'patrol' | 'chaos' | 'none' | 'rotator' | 'pulsing' | 'custom'
    density: number // 0 to 1
    behavior?: 'static' | 'dynamic' | 'aggressive' // Modifier
}

export interface LevelDef {
    ruleId: string
    obstacle?: ObstacleConfig
    stars?: Vector2[] // [NEW] Collectible locations
}

// 50 Levels of Normal Movement with Standard Obstacles
// 50 Levels of Normal Movement with Standard Obstacles
const levels: LevelDef[] = []
for (let i = 0; i < 50; i++) {
    levels.push({
        ruleId: 'normal_movement',
        obstacle: { type: 'custom', density: 0.5 }
    })
}

export const LevelSequenceV2 = levels
