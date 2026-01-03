export class Particle {
    x: number = 0
    y: number = 0
    vx: number = 0
    vy: number = 0
    life: number = 0
    maxLife: number = 1
    size: number = 1
    color: [number, number, number, number] = [1, 1, 1, 1]
    active: boolean = false
}

export class ParticleSystem {
    particles: Particle[]
    maxParticles: number
    readIndex: number = 0
    writeIndex: number = 0

    reset() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles[i].active = false
        }
    }

    constructor(maxParticles: number = 500) {
        this.maxParticles = maxParticles
        this.particles = new Array(maxParticles).fill(0).map(() => new Particle())
    }

    emit(x: number, y: number, config: {
        count: number,
        speed: number,
        life: number,
        color: [number, number, number, number],
        spread?: number
    }) {
        const { count, speed, life, color, spread = Math.PI * 2 } = config

        for (let i = 0; i < count; i++) {
            const p = this.particles[this.writeIndex]
            p.active = true
            p.x = x
            p.y = y
            p.life = life + Math.random() * 0.2 // Variance
            p.maxLife = p.life
            p.color = color
            p.size = Math.random() * 3 + 1

            const angle = Math.random() * spread
            const v = Math.random() * speed
            p.vx = Math.cos(angle) * v
            p.vy = Math.sin(angle) * v

            this.writeIndex = (this.writeIndex + 1) % this.maxParticles
        }
    }

    update(dt: number) {
        // We iterate all because it's a ring buffer, but only process active ones.
        // Optimization: Could track active count, but for 500 items, simple loop is fine.
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.particles[i]
            if (!p.active) continue

            p.x += p.vx * dt
            p.y += p.vy * dt
            p.life -= dt

            // Drag
            p.vx *= 0.95
            p.vy *= 0.95

            if (p.life <= 0) {
                p.active = false
            }
        }
    }
}
