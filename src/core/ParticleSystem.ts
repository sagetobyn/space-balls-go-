import { Vector2 } from './Vector2'

interface Particle {
    pos: Vector2
    vel: Vector2
    life: number
    maxLife: number
    color: string
    size: number
}

export class ParticleSystem {
    particles: Particle[] = []

    spawn(x: number, y: number, count: number, color: string, speed: number = 100) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const v = speed * (0.5 + Math.random())
            this.particles.push({
                pos: new Vector2(x, y),
                vel: new Vector2(Math.cos(angle) * v, Math.sin(angle) * v),
                life: 1.0,
                maxLife: 0.5 + Math.random() * 0.5,
                color: color,
                size: 2 + Math.random() * 3
            })
        }
    }

    update(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]
            p.life -= dt
            if (p.life <= 0) {
                this.particles.splice(i, 1)
                continue
            }
            p.pos = p.pos.add(p.vel.mul(dt))
            p.vel = p.vel.mul(0.95) // Drag
        }
    }
}
