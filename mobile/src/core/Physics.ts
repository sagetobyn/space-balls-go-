import { Entity } from './Entity'
import { Rule, RuleContext } from '../rules/Rule'
import { Vector2 } from './Vector2'


export interface PhysicsEvent {
    type: 'wall_hit'
    entity: Entity
    position: { x: number, y: number }
    force: number
}

export class PhysicsSystem {
    friction: number = 0.91 // Default friction (slightly increased)
    bounds: { width: number, height: number }

    constructor(width: number, height: number) {
        this.bounds = { width, height }
    }

    update(entities: Entity[], rule: Rule, dt: number, context: RuleContext): PhysicsEvent[] {
        const events: PhysicsEvent[] = []
        const player = entities.find(e => e.type === 'dot')
        const mirrorShield = entities.find(e => e.behavior === 'mirror_player')

        entities.forEach(entity => {
            this.applyBehavior(entity, dt, player) // [NEW] Apply AI/Behavior
            rule.onUpdate(entity, dt, context)

            // [NEW] Mirror Shield Collision
            if (mirrorShield && entity.type === 'obstacle' && entity !== mirrorShield) {
                if (entity.pos.dist(mirrorShield.pos) < entity.radius + mirrorShield.radius) {
                    // Destroy Obstacle
                    entity.pos.x = -9999; entity.pos.y = -9999 // Send to Void
                    entity.radius = 0 // Disable collision
                }
            }

            if (rule.shouldCheckBounds()) {
                const hit = this.checkBounds(entity)
                if (hit) events.push(hit)
            }
        })
        return events
    }

    private applyBehavior(entity: Entity, dt: number, player?: Entity) {
        if (entity.behavior === 'static') return

        if (entity.behavior === 'chase' && player) {
            let target = player.pos
            // Star-Chase Offset Support
            if (entity.mimicType === 'star-chase' && entity.mimicOffset) {
                target = player.pos.add(entity.mimicOffset)
            }

            const toTarget = target.sub(entity.pos)
            const dist = toTarget.mag()

            // Stealth Logic
            if (entity.mimicType === 'stealth') {
                entity.alpha = (dist < 200) ? 1 : 0
            }

            if (dist > 0) {
                let speed = 50 // Normal Chase Speed
                // Tuned Speeds (Reduced per user request "1.2x Pink")
                if (entity.mimicType === 'fast-chase') speed = 70 // Reduced from 80
                else if (entity.mimicType === 'star-chase') speed = 65
                else if (entity.mimicType === 'boss-core') speed = 40
                else if (entity.mimicType === 'ring-chase') speed = 120 // Special logic (Rings)

                const dir = toTarget.normalize()
                const currentVel = entity.vel
                const targetVel = dir.mul(speed)
                const steer = targetVel.sub(currentVel).mul(dt * 3.0)
                entity.vel = entity.vel.add(steer)
            }
        }

        if (entity.behavior === 'orbit' && entity.orbitCenter) {
            entity.orbitSpeed = entity.orbitSpeed || 1.0
            entity.orbitRadius = entity.orbitRadius || 100

            entity.angle += entity.orbitSpeed * dt
            const r = entity.orbitRadius
            entity.pos.x = entity.orbitCenter.x + Math.cos(entity.angle) * r
            entity.pos.y = entity.orbitCenter.y + Math.sin(entity.angle) * r
            // Orbit overrides velocity-based movement (teleport to orbit position)
            // But we might want 'vel' to reflect movement for collisions?
            // For now, hard set pos is fine for obstacles.
            entity.vel = new Vector2(0, 0) // Prevents double movement by Rule
        }

        if (entity.behavior === 'oscillating' && entity.oscilOrigin && entity.oscilDir) {
            entity.time = (entity.time || 0) + dt
            const speed = entity.oscilSpeed || 1.0
            const amp = entity.oscilAmp || 100

            // [FIX] Phase Shift: Use entity.angle as phase offset if present (e.g. for DNA Helix)
            const phase = entity.angle || 0
            const offset = Math.sin((entity.time * speed) + phase) * amp
            entity.pos = entity.oscilOrigin.add(entity.oscilDir.mul(offset))
            entity.vel = new Vector2(0, 0) // Override physics
        }

        if (entity.behavior === 'bouncing') {
            // Handled by default physics (vel integration + wall bounce)
            // ensure it doesn't stop
            if (entity.vel.mag() < 10) {
                entity.vel = new Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize().mul(100)
            }
        }

        if (entity.behavior === 'pulsing') {
            entity.time = (entity.time || 0) + dt
            const speed = entity.pulseSpeed || 1.0
            const min = entity.pulseMin || 10
            const max = entity.pulseMax || 20

            // Sine wave 0 to 1
            const wave = (Math.sin(entity.time * speed) + 1) / 2
            entity.radius = min + (max - min) * wave
        }

        if (entity.behavior === 'mirror_player' && player) {
            // Symmetrical Position (Point Reflection across Center)
            entity.pos.x = this.bounds.width - player.pos.x
            entity.pos.y = this.bounds.height - player.pos.y
            entity.vel = new Vector2(0, 0)
        }
    }



    checkBounds(entity: Entity): PhysicsEvent | null {
        let hit = false
        let force = 0

        if (entity.behavior === 'wrapping') {
            const margin = (entity.width || 0) / 2 + entity.radius
            if (entity.pos.x < -margin) entity.pos.x = this.bounds.width + margin
            if (entity.pos.x > this.bounds.width + margin) entity.pos.x = -margin
            return null
        }

        if (entity.pos.x < entity.radius) {
            entity.pos.x = entity.radius
            entity.vel.x *= -1
            hit = true; force = Math.abs(entity.vel.x)
        }
        if (entity.pos.x > this.bounds.width - entity.radius) {
            entity.pos.x = this.bounds.width - entity.radius
            entity.vel.x *= -1
            hit = true; force = Math.abs(entity.vel.x)
        }
        if (entity.pos.y < entity.radius) {
            entity.pos.y = entity.radius
            entity.vel.y *= -1
            hit = true; force = Math.abs(entity.vel.y)
        }
        if (entity.pos.y > this.bounds.height - entity.radius) {
            // Deadly Ground: Allow player ("dot") to fall through so we can detect death
            if (entity.type === 'dot') {
                // Do nothing, let it fall
            } else {
                entity.pos.y = this.bounds.height - entity.radius
                entity.vel.y *= -1
                hit = true; force = Math.abs(entity.vel.y)
            }
        }

        if (hit && force > 50) { // Ignore tiny jitters
            return {
                type: 'wall_hit',
                entity,
                position: { x: entity.pos.x, y: entity.pos.y },
                force
            }
        }
        return null
    }
}
