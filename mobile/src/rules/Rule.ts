import { Entity } from '../core/Entity'
import { Vector2 } from '../core/Vector2'

export interface InputState {
    isDown: boolean
}

export interface RuleContext {
    entities: Entity[]
    bounds: { width: number, height: number }
    inputState: { isDown: boolean, x: number, y: number }
}

export interface Camera {
    scale: number
    rotation: number
    offset: Vector2
}

export interface Rule {
    id: string
    name: string
    description: string

    // Input phases
    modifyInput(input: Vector2, dt: number, state: InputState): Vector2

    // Physics phases
    modifyDeltaTime(dt: number, context: RuleContext): number // [NEW]
    onUpdate(entity: Entity, dt: number, context: RuleContext): void
    shouldCheckBounds(): boolean

    // Render phases
    modifyCamera(camera: Camera, dt: number): Camera
    onRender?(ctx: any, width: number, height: number): void

    // Lifecycle
    onEnter?(context: RuleContext): void
    onExit?(context: RuleContext): void
}

export class BaseRule implements Rule {
    id: string
    name: string
    description: string

    constructor(id: string, name: string, description: string) {
        this.id = id
        this.name = name
        this.description = description
    }

    modifyInput(input: Vector2, dt: number, state: InputState): Vector2 {
        return input
    }

    applyStandardPhysics(entity: Entity, dt: number) {
        if (entity.type === 'dot') {
            const FRICTION = 0.94
            const BASE_MAX_SPEED = 500

            // Get speed modifier from settings (0.7 = SLOW, 1.0 = NORMAL, 1.3 = FAST)
            let speedModifier = 1.0
            try {
                const { useGameStore } = require('../store/gameStore')
                speedModifier = useGameStore.getState().settings.speedModifier || 1.0
            } catch (e) {
                // Store not available, use default
            }

            const MAX_SPEED = BASE_MAX_SPEED * speedModifier

            // Time-corrected friction:
            // If dt is 1/60 (60fps), power is 1 -> 0.9
            // If dt is 1/30 (30fps), power is 2 -> 0.81 (stronger single-frame friction to match 2x 60fps frames)
            const timeCorrectedFriction = Math.pow(FRICTION, dt * 60)

            entity.vel = entity.vel.mul(timeCorrectedFriction)
            if (entity.vel.mag() > MAX_SPEED) {
                entity.vel = entity.vel.normalize().mul(MAX_SPEED)
            }
        }
    }

    onUpdate(entity: Entity, dt: number, context: RuleContext): void {
        // Default physics
        this.applyStandardPhysics(entity, dt)
        entity.pos = entity.pos.add(entity.vel.mul(dt))
    }

    shouldCheckBounds(): boolean {
        return true
    }

    modifyCamera(camera: Camera, dt: number): Camera {
        return camera
    }

    modifyDeltaTime(dt: number, context: RuleContext): number {
        return dt
    }

    onRender(ctx: any, width: number, height: number): void { }

    onEnter(context: RuleContext): void { }
    onExit(context: RuleContext): void { }
}
