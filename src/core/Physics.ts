import { Entity } from './Entity'
import { Rule } from '../rules/Rule'


export class PhysicsSystem {
    friction: number = 0.95 // Default friction
    bounds: { width: number, height: number }

    constructor(width: number, height: number) {
        this.bounds = { width, height }
    }

    update(entities: Entity[], rule: Rule, dt: number, context: { entities: Entity[], bounds: { width: number, height: number } }) {
        entities.forEach(entity => {
            // 1. Rule modifies update logic directly
            // If rule doesn't override physics completely, we can add base physics here
            // But for this game, the Rule should likely control the integration step to allow "Time stops" etc.

            rule.onUpdate(entity, dt, context)

            // 2. Bounds collision
            if (rule.shouldCheckBounds()) {
                this.checkBounds(entity)
            }
        })
    }

    checkBounds(entity: Entity) {
        if (entity.pos.x < entity.radius) {
            entity.pos.x = entity.radius
            entity.vel.x *= -1
        }
        if (entity.pos.x > this.bounds.width - entity.radius) {
            entity.pos.x = this.bounds.width - entity.radius
            entity.vel.x *= -1
        }
        if (entity.pos.y < entity.radius) {
            entity.pos.y = entity.radius
            entity.vel.y *= -1
        }
        if (entity.pos.y > this.bounds.height - entity.radius) {
            entity.pos.y = this.bounds.height - entity.radius
            entity.vel.y *= -1
        }
    }
}
