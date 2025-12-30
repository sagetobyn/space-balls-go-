import { Entity } from '../core/Entity'
import { Vector2 } from '../core/Vector2'

export interface InputState {
    isDown: boolean
}

export interface RuleContext {
    entities: Entity[]
    bounds: { width: number, height: number }
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
    onUpdate(entity: Entity, dt: number, context: RuleContext): void
    shouldCheckBounds(): boolean

    // Render phases
    modifyCamera(camera: Camera, dt: number): Camera
    onRender?(ctx: CanvasRenderingContext2D, width: number, height: number): void

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

    modifyInput(input: Vector2, _dt: number, _state: InputState): Vector2 {
        return input
    }

    applyStandardPhysics(entity: Entity, dt: number) {
        if (entity.id === 'player') {
            const FRICTION = 0.90
            const MAX_SPEED = 1000

            // Time-corrected friction for 60fps baseline
            const timeCorrectedFriction = Math.pow(FRICTION, dt * 60)

            entity.vel = entity.vel.mul(timeCorrectedFriction)
            if (entity.vel.mag() > MAX_SPEED) {
                entity.vel = entity.vel.normalize().mul(MAX_SPEED)
            }
        }
    }

    onUpdate(entity: Entity, dt: number, _context: RuleContext): void {
        // Default physics
        this.applyStandardPhysics(entity, dt)
        entity.pos = entity.pos.add(entity.vel.mul(dt))
    }

    shouldCheckBounds(): boolean {
        return true
    }

    modifyCamera(camera: Camera, _dt: number): Camera {
        return camera
    }

    onRender(_ctx: CanvasRenderingContext2D, _width: number, _height: number): void { }

    onEnter(_context: RuleContext): void { }
    onExit(_context: RuleContext): void { }
}
