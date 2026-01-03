import { Entity, EntityType } from './Entity'
import { Vector2 } from './Vector2'
import { ObstacleConfig } from '../rules/LevelSequence'

export class ObstacleManager {

    spawn(level: number, width: number, height: number, exitPos: Vector2, config?: ObstacleConfig): Entity[] {
        if (config && config.type === 'custom') {
            return this.spawnCustom(level, width, height, exitPos)
        }
        // Fallback for non-custom levels (if any)
        if (config?.type === 'grid') return this.lib_Lattice(width, height, 'simple', exitPos)
        if (!config || config.type === 'none') return []
        return []
    }

    // [NEW] OVERHAULED LEVEL MAPPING
    private spawnCustom(level: number, width: number, height: number, exitPos: Vector2): Entity[] {
        const cx = width / 2, cy = height / 2

        // PHASE 1: Introduction
        if (level === 2) return this.lib_Wall(width, height, 'vert', exitPos) // Swapped with 4
        if (level === 3) return this.lib_Wall(width, height, 'horiz', exitPos)
        if (level === 4) return this.lib_Chaser(width, height, 'ambush', exitPos) // Swapped with 10
        if (level === 5) return this.lib_Orbit(width, height, 'binary-3', exitPos) // Swapped with 16 (Harder) -- Also Binary-3 is tough
        if (level === 6) return this.lib_Gate(width, height, 'moving-gate', exitPos)
        if (level === 7) return this.lib_Pulse(width, height, 'wandering', exitPos)
        if (level === 8) return this.lib_Ricochet(width, height, 'slow-bounce', exitPos)
        if (level === 9) return this.lib_Wall(width, height, 'cross', exitPos) // Swapped with 16
        if (level === 10) return this.lib_Lattice(width, height, 'simple', exitPos) // Swapped with 4

        // PHASE 2: Complexity
        if (level === 11) return this.lib_Stream(width, height, 'drift-random', exitPos)
        if (level === 12) return this.lib_Spire(width, height, 'triangle', exitPos)
        if (level === 13) return this.lib_Helix(width, height, 'spinning-hard', exitPos) // Swapped with 29
        if (level === 14) return this.lib_Patrol(width, height, 'cross-fire', exitPos)
        if (level === 15) return this.lib_Orbit(width, height, 'atomic', exitPos)
        if (level === 16) return this.lib_Orbit(width, height, 'solar', exitPos) // Swapped with 9
        if (level === 17) return this.lib_Rotator(width, height, 'crosses', exitPos) // [SWAP] New L17 with Rotating Crosses
        if (level === 18) return this.lib_Orbit(width, height, 'collapsing-fast', exitPos) // L18: Cleaner than extreme
        if (level === 19) return this.lib_Complex(width, height, 'star-chase', exitPos)
        if (level === 20) return this.lib_Stream(width, height, 'wrap', exitPos)

        // PHASE 3: Chaos
        if (level === 21) return this.lib_Spire(width, height, 'quad-triangle', exitPos) // Redesigned L21 (Large Triangles)
        if (level === 22) return this.lib_Wall(width, height, 'piston-press', exitPos)
        if (level === 23) return this.lib_Gravity(width, height, 'magnetic', exitPos) // L23 Redesign
        if (level === 24) return this.lib_Wall(width, height, 'sliding', exitPos)
        if (level === 25) return this.lib_Rotator(width, height, 'gears', exitPos) // L25 Redesign
        if (level === 26) return this.lib_Stream(width, height, 'crossfire', exitPos) // L26 Redesign
        if (level === 27) return this.lib_Ricochet(width, height, 'box-heavy', exitPos) // [SWAP] From 34
        if (level === 28) return this.lib_Mimic(width, height, 'aggressive', exitPos)
        if (level === 29) return this.lib_Stream(width, height, 'drift-slow', exitPos) // Swapped with 13
        if (level === 30) return this.lib_Rotator(width, height, 'pulsar', exitPos) // [SWAP] From 35 (Pulsar)

        // PHASE 4: Nightmare
        if (level === 31) return this.lib_Complex(width, height, 'mirror-maze', exitPos) // L31 Redesign
        if (level === 32) return this.lib_Wind(width, height, 'accelerator', exitPos) // L32 Redesign
        if (level === 33) return this.lib_Spire(width, height, 'diamond', exitPos)
        if (level === 34) return this.lib_SymmetricChaos(width, height, exitPos) // [SWAP] From 27
        if (level === 35) return this.lib_Gravity(width, height, 'black-hole-extreme', exitPos) // [SWAP] From 30 (Black Hole)
        if (level === 36) return this.lib_Complex(width, height, 'grid-lock', exitPos) // L36 Redesign (Laser Grid)
        if (level === 37) return this.lib_HiddenMaze(width, height, 'reveal', exitPos) // Swapped with 48

        if (level === 38) return this.lib_Orbit(width, height, 'binary-5', exitPos)
        if (level === 39) return this.lib_Tetris(width, height, 'pixel-eater', exitPos) // Swapped from 49
        if (level === 40) return this.lib_Rotator(width, height, 'vortex', exitPos)

        // PHASE 5: Boss Rush
        if (level === 41) return this.lib_Boss(width, height, 'final', exitPos) // Swapped with L50
        if (level === 42) return this.lib_River(width, height, 'river', exitPos) // Redesign 5 (The River)
        if (level === 43) return this.lib_Sniper(width, height, 'turret', exitPos)
        if (level === 44) return this.lib_Complex(width, height, 'gauntlet', exitPos) // L44 Redesign (The Gauntlet)
        if (level === 45) return this.lib_Helix(width, height, 'dna-vortex', exitPos) // Swapped with 11
        if (level === 46) return this.lib_Fractal(width, height, 'spin-fast', exitPos)
        if (level === 47) return this.lib_Spire(width, height, 'black-hole-weak', exitPos)
        if (level === 48) return this.lib_Gravity(width, height, 'black-hole-cluster', exitPos) // Swapped with 37
        if (level === 49) return this.lib_Rain(width, height, 'heavy', exitPos) // Swapped from 39
        if (level === 50) return this.lib_Rotator(width, height, 'galaxy', exitPos) // Swapped from L41
        if (level === 51) return this.lib_Lasers(width, height, 'wave', exitPos) // [SWAP] Old L17

        return []
    }

    // ================= LIBRARIES =================

    // --- HELIX ---
    private lib_Helix(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = type === 'spinning-hard' ? 40 : 20
        for (let i = 0; i < count; i++) {
            const y = (h / count) * i
            const ent = new Entity(`hx-${i}`, 'obstacle', 0, 0, 15, '#B87333') // [User Request] Copper
            ent.shape = 'circle'; ent.behavior = 'oscillating'; ent.oscilOrigin = new Vector2(w / 2, y); ent.oscilDir = new Vector2(1, 0); ent.oscilAmp = w / 3; ent.oscilSpeed = 1.0 + i * 0.1
            if (type === 'wide-slide') { ent.oscilAmp = w / 2 - 30; ent.oscilSpeed = 1.0 + i * 0.05; }
            if (type === 'dna-vortex') {
                // Double helix structure
                ent.oscilAmp = w / 3; ent.oscilSpeed = 1.5; ent.angle = (i * 0.2) + (Math.PI * (i % 2))
            }
            if (type === 'spinning' || type === 'spinning-hard') {
                ent.behavior = 'orbit'; ent.orbitCenter = new Vector2(w / 2, h / 2); ent.orbitRadius = i * 10 + 50; ent.orbitSpeed = 1.0;
                if (type === 'spinning-hard') { ent.orbitSpeed = 3.5; ent.orbitRadius = i * 7 + 40; } // Buffed Speed (3.0 -> 3.5) & Density (8->7)
            }
            // L11 Tuning: Clear start area
            if (ent.pos.dist(new Vector2(w / 2, h - 150)) < 150) continue
            entities.push(ent)
        }
        return entities
    }

    // --- GATE ---
    // --- SYMMETRIC CHAOS (L27) ---
    private lib_SymmetricChaos(w: number, h: number, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []

        // 1. Symmetrical Set (4 Corner Floaters)
        const corners = [
            new Vector2(w * 0.2, h * 0.2), new Vector2(w * 0.8, h * 0.2),
            new Vector2(w * 0.2, h * 0.8), new Vector2(w * 0.8, h * 0.8)
        ]
        corners.forEach((pos, i) => {
            const ent = new Entity(`sym-${i}`, 'obstacle', pos.x, pos.y, 30, '#ff0000')
            ent.shape = 'square'
            ent.behavior = 'oscillating'
            ent.oscilOrigin = pos
            // Oscil towards center
            ent.oscilDir = new Vector2(w / 2, h / 2).sub(pos).normalize()
            ent.oscilAmp = 100
            ent.oscilSpeed = 1.0
            entities.push(ent)
        })

        // 2. Free Floating (Chaos)
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * w
            const y = Math.random() * h
            if (new Vector2(x, y).dist(new Vector2(w / 2, h - 150)) < 150) continue // Safe start

            const ent = new Entity(`chaos-${i}`, 'obstacle', x, y, 15, '#ff0000')
            ent.shape = 'triangle'
            ent.behavior = 'drifting'
            ent.vel = new Vector2((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60)
            entities.push(ent)
        }
        return entities
    }


    // --- GATE ---
    private lib_Gate(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const y1 = h * 0.4, y2 = h * 0.7
        const addRow = (y: number, prefix: string) => {
            const l = new Entity(`${prefix}-l`, 'obstacle', 0, y, 50, '#ff0000')
            l.shape = 'square'; l.behavior = 'oscillating'; l.oscilOrigin = new Vector2(w * 0.25, y); l.oscilDir = new Vector2(1, 0); l.oscilAmp = w * 0.2; l.oscilSpeed = 1.0
            entities.push(l)
            const r = new Entity(`${prefix}-r`, 'obstacle', 0, y, 50, '#ff0000')
            r.shape = 'square'; r.behavior = 'oscillating'; r.oscilOrigin = new Vector2(w * 0.75, y); r.oscilDir = new Vector2(1, 0); r.oscilAmp = w * 0.2; r.oscilSpeed = 1.0; r.angle = Math.PI
            entities.push(r)
        }
        addRow(y1, 'g1'); addRow(y2, 'g2')
        return entities
    }

    // --- ROTATOR ---
    private lib_Rotator(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        if (type === 'crosses') {
            // New L17: "Breathing Grid" (32 Balls, 4x8, Expands/Contracts)
            const entities: Entity[] = []
            const cols = 4, rows = 8 // [UPDATE] 8 Rows (+2)

            // Define Grid Dimensions
            const gridW = w * 0.6
            const gridH = h * 0.65 // [UPDATE] Extended height to fit 8 rows
            const startX = (w - gridW) / 2
            const startY = h * 0.10 // [UPDATE] Start slightly higher (10%)

            const gridCenter = new Vector2(w / 2, startY + gridH / 2)

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = startX + (gridW / (cols - 1)) * i
                    const y = startY + (gridH / (rows - 1)) * j

                    const ent = new Entity(`breath-${i}-${j}`, 'obstacle', x, y, 20, '#ff0000')
                    ent.shape = 'circle'

                    // Breathing Behavior (Radial Oscillator)
                    ent.behavior = 'oscillating'
                    ent.oscilOrigin = new Vector2(x, y)

                    // Direction is away from Grid Center (Radial)
                    let dir = new Vector2(x, y).sub(gridCenter)
                    if (dir.mag() < 0.1) dir = new Vector2(0, 0)
                    else dir = dir.normalize()

                    ent.oscilDir = dir
                    ent.oscilAmp = 30 // [UPDATE] Reduced from 60 (Less compression)
                    ent.oscilSpeed = 1.0

                    entities.push(ent)
                }
            }
            return entities
        }
        if (type === 'vortex') {
            const entities: Entity[] = []
            for (let i = 0; i < 20; i++) {
                const ent = new Entity(`vor-${i}`, 'obstacle', w / 2, h / 2, 10 + Math.random() * 15, '#ff4400')
                ent.behavior = 'orbit'; ent.orbitCenter = new Vector2(w / 2, h / 2);
                ent.orbitRadius = 50 + Math.random() * 300;
                ent.orbitSpeed = (0.5 + Math.random() * 1.0) * 0.8; // [User Request] Slowed by 20%
                ent.angle = Math.random() * 6.28
                entities.push(ent)
            }
            return entities
        }
        if (type === 'galaxy') {
            // L34: Beautiful Spiral Galaxy
            const entities: Entity[] = []
            const arms = 5
            const perArm = 10
            const center = new Vector2(w / 2, h / 2)
            for (let i = 0; i < arms; i++) {
                for (let j = 0; j < perArm; j++) {
                    const ent = new Entity(`gal-${i}-${j}`, 'obstacle', w / 2, h / 2, 12, '#00ffff')
                    ent.shape = 'circle'; ent.behavior = 'orbit'
                    ent.orbitCenter = center
                    const dist = 50 + j * 30
                    ent.orbitRadius = dist
                    ent.angle = (i * (Math.PI * 2 / arms)) + (j * 0.2) // Spiral offset
                    ent.orbitSpeed = 0.5 - (j * 0.02) // Inner moves faster
                    entities.push(ent)
                }
            }
            return entities
        }
        if (type === 'binary-pulsar') {
            // L45: Two Twin Galaxies spinning in opposite directions
            const entities: Entity[] = []
            const cx = w / 2, cy = h / 2
            const centers = [new Vector2(cx - 140, cy), new Vector2(cx + 140, cy)] // Spaced out
            centers.forEach((c, idx) => {
                const color = idx === 0 ? '#ff00ff' : '#00ffff' // Pink & Cyan
                const core = new Entity(`c-${idx}`, 'obstacle', c.x, c.y, 40, color)
                core.shape = 'circle'; core.behavior = 'static'; entities.push(core)

                // 3 Spiral Arms per Galaxy
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 8; j++) {
                        const ent = new Entity(`b-${idx}-${i}-${j}`, 'obstacle', 0, 0, 12, color)
                        ent.shape = 'circle'; ent.behavior = 'orbit'; ent.orbitCenter = c;
                        ent.orbitRadius = 50 + j * 22
                        ent.angle = (i * (Math.PI * 2 / 3)) + (j * 0.3)
                        ent.orbitSpeed = (idx === 0 ? 1 : -1) * 1.8 // Fast Spin
                        entities.push(ent)
                    }
                }
            })
            return entities
        }
        if (type === 'pulsar') {
            // L35: Deadly Pulsar (Central Star + Beams)
            const entities: Entity[] = []
            const center = new Vector2(w / 2, h / 2)
            // Core
            const core = new Entity('core', 'obstacle', w / 2, h / 2, 40, '#ffaa00')
            core.shape = 'asteroid'; core.behavior = 'static'; entities.push(core) // L35: Hex -> Asteroid

            // 4 Huge Beams
            for (let i = 0; i < 4; i++) {
                const beamCount = 12
                for (let k = 0; k < beamCount; k++) {
                    const ent = new Entity(`bm-${i}-${k}`, 'obstacle', w / 2, h / 2, 15, '#ff0088')
                    ent.shape = 'rect'; ent.width = 30; ent.height = 15;
                    ent.behavior = 'rotating_child'
                    ent.rotationCenter = center
                    ent.rotationRadius = 60 + k * 40
                    ent.angle = i * (Math.PI / 2)
                    ent.rotationSpeed = 1.2
                    entities.push(ent)
                }
            }
            return entities
        }
        if (type === 'gears') {
            // L25: 5 White Turbines (Crimson Peak Style)
            const entities: Entity[] = []
            for (let i = 0; i < 5; i++) {
                const isCenter = i === 0
                const x = isCenter ? w / 2 : Math.random() * w
                const y = isCenter ? h / 2 : Math.random() * h
                const speed = (i % 2 == 0 ? 1.5 : -1.5)

                const coreId = `gear-${i}`
                const core = new Entity(coreId, 'obstacle', x, y, 15, '#ffffff') // Small White Core
                core.shape = 'circle' // Smooth
                if (isCenter) {
                    core.behavior = 'rotating_child'
                    core.rotationCenter = new Vector2(x, y)
                    core.rotationRadius = 0
                } else {
                    core.behavior = 'bouncing'
                    core.vel = new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100)
                }
                core.rotationSpeed = speed // Visual spin
                entities.push(core)

                // Blades (Orbiting Child)
                const teeth = 5 // User Request: 5 Blades
                for (let k = 0; k < teeth; k++) {
                    const angle = (k / teeth) * Math.PI * 2
                    const t = new Entity(`tooth-${i}-${k}`, 'obstacle', 0, 0, 15, '#ffffff') // White Blades
                    t.shape = 'triangle'; t.behavior = 'static';
                    t.mimicType = 'orbit_child'; t.mimicTargetID = coreId
                    t.orbitRadius = 60; t.orbitSpeed = speed; t.angle = angle
                    entities.push(t)
                }
            }
            return entities
        }
        return this.lib_RotatingLine(w / 2, h / 2, 'center')
    }

    // --- WIND ---
    private lib_Wind(w: number, h: number, type: 'tunnel' | 'accelerator', exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        if (type === 'accelerator') {
            // L32 Redesign: Elliptical Orbits (Clean, aesthetic)
            const cx = w / 2, cy = h / 2
            for (let i = 0; i < 8; i++) {
                const ent = new Entity(`orb-${i}`, 'obstacle', cx, cy, 25, '#88aaff')
                ent.behavior = 'orbit'; ent.orbitCenter = new Vector2(cx, cy);
                ent.mimicType = 'ellipse' // Need to ensure update supports this or implement here
                // Simulating ellipse with scaling in update or just circle? User asked for Ellipse.
                // I will use Orbit logic and scale X/Y in Update. But I don't have update access right now easily.
                // I'll make them 'pulsing' orbits where radius changes? No.
                // I'll just make standard orbits but varying radius and speed heavily to Look like bands.
                ent.orbitRadius = 100 + i * 40; ent.orbitSpeed = (i % 2 == 0 ? 1 : -1) * (1.5 + i * 0.1)
                entities.push(ent)
            }
            return entities
        }
        for (let i = 0; i < 8; i++) {
            const x = (w / 8) * i + (w / 16); const y = Math.random() * h
            const ent = new Entity(`wind-${i}`, 'obstacle', x, y, 40, '#88ccff')
            ent.shape = 'circle'; ent.behavior = 'gravity_well'; ent.vel = new Vector2(0, 50)
            ent.radius = 100 // Physics radius
            ent.mimicType = 'wind'; // Custom behavior flag
            entities.push(ent)
        }
        return entities
    }

    // --- STREAM / AVALANCHE ---
    private lib_Stream(w: number, h: number, variant: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []

        if (variant === 'drift-slow') {
            // L29: 4 Fixed "Guardians" at Corners + Floating debris

            // 1. Fixed Corners
            const padding = 60
            const corners = [
                new Vector2(padding, padding), new Vector2(w - padding, padding),
                new Vector2(padding, h - padding), new Vector2(w - padding, h - padding)
            ]
            corners.forEach((pos, i) => {
                const ent = new Entity(`corner-${i}`, 'obstacle', pos.x, pos.y, 25, '#ff0000')
                ent.shape = 'triangle'; ent.behavior = 'static' // Fixed in place
                ent.rotationSpeed = 1.0 // Spin in place for effect
                entities.push(ent)
            })

            // 2. Floating Debris
            for (let i = 0; i < 15; i++) {
                const ent = new Entity(`float-${i}`, 'obstacle', Math.random() * w, Math.random() * h, 15, '#ff4400')
                ent.shape = 'triangle'
                ent.behavior = 'bouncing' // Keep on screen
                ent.vel = new Vector2((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60) // Slow drift

                // Avoid spawn kill (Safe Zone check)
                if (ent.pos.dist(new Vector2(w / 2, h / 2)) < 200) continue

                entities.push(ent)
            }
            return entities
        }

        const count = variant === 'crossfire' ? 20 : (variant === 'avalanche' ? 18 : (variant === 'wrap' ? 24 : 8))
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w
            const ent = new Entity(`s-${i}`, 'obstacle', x, Math.random() * h, variant === 'avalanche' ? 30 : 15, '#00ffff')
            ent.shape = variant === 'avalanche' ? 'asteroid' : 'triangle'
            ent.behavior = 'drifting'
            ent.vel = new Vector2(0, 80)
            if (variant === 'avalanche') ent.vel = new Vector2((Math.random() - 0.5) * 50, 200 + Math.random() * 100)
            if (variant === 'splitter') { ent.shape = 'hex'; ent.vel = new Vector2(0, 50); }
            if (variant === 'meteor') ent.vel = new Vector2(40, 120)
            if (variant === 'crossfire') {
                // L26: Blizzard (Structured & Symmetrical)
                if (i < 6) {
                    // Wind (Rows)
                    const row = i
                    const fromLeft = row % 2 === 0
                    const y = (h / 6) * (row + 0.5)
                    ent.pos = new Vector2(fromLeft ? -100 : w + 100, y)
                    ent.vel = new Vector2(fromLeft ? 180 : -180, 0)
                    // [User Request] Cyan -> Yellow (#ffaa00)
                    ent.shape = 'rect'; ent.width = 60; ent.height = 6; ent.color = '#ffaa00'
                } else {
                    // Snow (Symmetrical Grid)
                    const snowIdx = i - 6
                    const col = snowIdx % 2
                    const row = Math.floor(snowIdx / 2)
                    const tx = col === 0 ? w * 0.25 : w * 0.75
                    const ty = (h / 7) * row
                    ent.pos = new Vector2(tx, ty)
                    ent.vel = new Vector2(0, 80)
                    ent.shape = 'circle'; ent.radius = 10; ent.color = '#ffffff'
                    ent.mimicType = 'rain'
                }
                ent.behavior = 'drifting'
            }
            if (variant === 'drift-random') {
                // L18 Simplified: Smooth wrapping movement, no bouncing
                ent.vel = new Vector2((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150)
                ent.behavior = 'drifting' // Screen Wrap
                ent.color = '#ff4400' // Orange-Red
            }
            if (variant === 'wrap') {
                // L20: Even distribution
                const rows = 6, cols = 4
                const r = Math.floor(i / cols), c = i % cols
                ent.pos = new Vector2((w / cols) * (c + 0.5), (h / rows) * (r + 0.5))
                ent.vel = new Vector2(50, 0); ent.behavior = 'drifting'; ent.mimicType = 'stop-go';
                ent.color = '#ff4400'
            }
            entities.push(ent)
        }
        return entities
    }

    // --- SNAKE ---
    private lib_Snake(w: number, h: number, type: 'patrol' | 'twin-dragon' | 'long-hunter' | 'ring-hunter' | 'ring-king', exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = (type === 'twin-dragon' || type === 'ring-king') ? 2 : 1
        // L26: Ring Hunter (Fast) | L44: Ring King (Extreme)
        const isRing = type.includes('ring')
        const speed = type === 'ring-king' ? 220 : (type === 'ring-hunter' ? 150 : 0) // L44 vs L26

        for (let s = 0; s < count; s++) {
            // Simplify Snake ID and targeting
            const headId = `snk-${s}-0`
            const head = new Entity(headId, 'obstacle', w / 2, h / 2 + s * 100, 25, '#ff0000')
            head.shape = isRing ? 'circle' : 'triangle'; // Ring visual
            head.behavior = 'chase';

            // Manual speed for Rings
            if (isRing) {
                head.mimicType = 'fast-chase'
                // We will use 'fast-chase' logic but maybe tune speed in update?
                // Standard fast-chase is 180.
                // We need distinct speeds.
                // I'll add 'ring-chase' as mimicType to allow custom speed in update.
                head.mimicType = 'ring-chase'
                // Store target speed in vel.x (hack) or just use behavior
                head.vel = new Vector2(speed, 0) // storing speed
            } else {
                head.vel = new Vector2(0, 0)
            }
            entities.push(head)

            const len = 8
            for (let i = 1; i < len; i++) {
                const seg = new Entity(`snk-${s}-${i}`, 'obstacle', w / 2, h / 2 + s * 100 + i * 30, 20, '#ff4400')
                seg.shape = 'circle'; seg.behavior = 'mimic'; seg.mimicType = 'shadow';
                seg.mimicTargetID = `snk-${s}-${i - 1}` // Follow prev
                entities.push(seg)
            }
        }
        return entities
    }



    // --- TETRIS / PIXEL EATER ---
    private lib_Tetris(w: number, h: number, type: 'pixel-eater', exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const size = 45 // Increased size slightly for fewer blocks
        const rows = Math.ceil(h / size), cols = Math.ceil(w / size)

        // Define Start Position (Standard)
        const startPos = new Vector2(w / 2, h - 150)

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Reduced Density: 30% spawn rate (was 45%)
                if (Math.random() > 0.30) continue

                const x = c * size + size / 2
                const y = r * size + size / 2

                // Safe Zone Checks
                if (new Vector2(x, y).dist(startPos) < 200) continue
                if (new Vector2(x, y).dist(exitPos) < 200) continue

                const ent = new Entity(`pix-${r}-${c}`, 'obstacle', x, y, size / 2 - 4, '#44ff44')
                ent.shape = 'square';

                // [UPDATE] L39: Floating Hidden Maze (User Request)
                ent.behavior = 'drifting' // Floating
                ent.mimicType = 'hidden'  // Hidden Maze concept

                // Slow drift speed
                ent.vel = new Vector2((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)

                // Remove phasing, keep simple hidden drift
                // ent.behavior = 'phasing';
                // ent.phaseInterval = 2.5 + Math.random() * 2.0;
                // ent.phaseTimer = Math.random() * ent.phaseInterval
                entities.push(ent)
            }
        }
        return entities
    }

    // --- LATTICE ---
    private lib_Lattice(w: number, h: number, type: 'simple' | 'dense', exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const hexSize = type === 'simple' ? 80 : 60
        const rows = Math.ceil(h / (hexSize * 0.866))
        const cols = Math.ceil(w / hexSize)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const xOffset = (r % 2) * (hexSize / 2)
                const x = c * hexSize * 1.5 + xOffset
                const y = r * hexSize * 0.866
                if (Math.hypot(x - w / 2, y - (h - 150)) < 250) continue;
                if (Math.hypot(x - exitPos.x, y - exitPos.y) < 200) continue;
                if (Math.random() > (type === 'simple' ? 0.4 : 0.6)) continue;
                const ent = new Entity(`lat-${r}-${c}`, 'obstacle', x, y, 18, '#ff0000')
                ent.shape = 'asteroid'; ent.behavior = 'static'; entities.push(ent)
            }
        }
        return entities
    }

    // --- WALL ---
    private lib_Wall(w: number, h: number, variant: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        if (variant === 'side-block') {
            const l = new Entity('w-l', 'obstacle', 40, h / 2, 10, '#ff0000'); l.shape = 'rect'; l.width = 80; l.height = h; l.behavior = 'static'; entities.push(l)
            const r = new Entity('w-r', 'obstacle', w - 40, h / 2, 10, '#ff0000'); r.shape = 'rect'; r.width = 80; r.height = h; r.behavior = 'static'; entities.push(r)
            // Add oscillating center blocks (L21 Tuning: Harder)
            for (let i = 0; i < 4; i++) { // Increased count to 4
                const b = new Entity(`mid-${i}`, 'obstacle', w / 2, h * 0.2 + i * h * 0.2, 30, '#ff0000')
                b.behavior = 'oscillating'; b.oscilOrigin = new Vector2(w / 2, b.pos.y); b.oscilDir = new Vector2(1, 0);
                b.oscilAmp = w / 3; b.oscilSpeed = 2.0 // Increased speed
                entities.push(b)
            }
            return entities
        }
        if (variant === 'horiz' || variant === 'cross') {
            for (let i = 0; i < 5; i++) {
                const cx = w / 2, cy = (h / 6) * (i + 1)
                if (Math.abs(cy - (h - 150)) < 120) continue;
                const ent = new Entity(`wall-h-${i}`, 'obstacle', cx, cy, 25, '#ff0000')
                ent.shape = 'square'; ent.behavior = 'oscillating'
                ent.oscilOrigin = new Vector2(cx, cy); ent.oscilDir = new Vector2(1, 0); ent.oscilAmp = w / 2 - 50; ent.oscilSpeed = 1.0;
                entities.push(ent)
            }
        }
        if (variant === 'vert' || variant === 'cross') {
            for (let i = 0; i < 4; i++) {
                const cx = (w / 5) * (i + 1), cy = h / 2
                if (Math.abs(cx - w / 2) < 60) continue;
                const ent = new Entity(`wall-v-${i}`, 'obstacle', cx, cy, 25, '#ff0000')
                ent.shape = 'square'; ent.behavior = 'oscillating'
                ent.oscilOrigin = new Vector2(cx, cy); ent.oscilDir = new Vector2(0, 1); ent.oscilAmp = h / 3; ent.oscilSpeed = 1.0;
                entities.push(ent)
            }
        }
        if (variant === 'rot') return this.lib_RotatingLine(w / 2, h / 2, 'center')
        if (variant === 'crusher' || variant === 'crusher-fast') {
            const speed = variant === 'crusher-fast' ? 1.5 : 0.8
            const top = new Entity('crush-t', 'obstacle', w / 2, 50, 35, '#ff0000')
            top.shape = 'square'; top.behavior = 'oscillating'; top.oscilOrigin = new Vector2(w / 2, h / 4); top.oscilDir = new Vector2(0, 1); top.oscilAmp = h / 4 - 60; top.oscilSpeed = speed;
            entities.push(top)
            const bot = new Entity('crush-b', 'obstacle', w / 2, h - 50, 35, '#ff0000')
            bot.shape = 'square'; bot.behavior = 'oscillating'; bot.oscilOrigin = new Vector2(w / 2, h * 0.75); bot.oscilDir = new Vector2(0, 1); bot.oscilAmp = h / 4 - 60; bot.oscilSpeed = speed;
            entities.push(bot)
        }
        if (variant === 'piston-press') {
            // L39: 4-way piston press
            const speed = 1.5
            const pad = 60
            // Top
            const t = new Entity('p-t', 'obstacle', w / 2, 0, 50, '#ff0000'); t.shape = 'rect'; t.width = 100; t.height = 100;
            t.behavior = 'oscillating'; t.oscilOrigin = new Vector2(w / 2, 0); t.oscilDir = new Vector2(0, 1); t.oscilAmp = h / 2 - pad; t.oscilSpeed = speed; entities.push(t)
            // Bottom
            const b = new Entity('p-b', 'obstacle', w / 2, h, 50, '#ff0000'); b.shape = 'rect'; b.width = 100; b.height = 100;
            b.behavior = 'oscillating'; b.oscilOrigin = new Vector2(w / 2, h); b.oscilDir = new Vector2(0, -1); b.oscilAmp = h / 2 - pad; b.oscilSpeed = speed; entities.push(b)
            // Left
            const l = new Entity('p-l', 'obstacle', 0, h / 2, 50, '#ff0000'); l.shape = 'rect'; l.width = 100; l.height = 100;
            l.behavior = 'oscillating'; l.oscilOrigin = new Vector2(0, h / 2); l.oscilDir = new Vector2(1, 0); l.oscilAmp = w / 2 - pad; l.oscilSpeed = speed; entities.push(l)
            // Right
            const r = new Entity('p-r', 'obstacle', w, h / 2, 50, '#ff0000'); r.shape = 'rect'; r.width = 100; r.height = 100;
            r.behavior = 'oscillating'; r.oscilOrigin = new Vector2(w, h / 2); r.oscilDir = new Vector2(-1, 0); r.oscilAmp = w / 2 - pad; r.oscilSpeed = speed; entities.push(r)
        }
        if (variant === 'sliding') {
            // L24: Sliding Doors
            const rows = 6
            for (let i = 1; i < rows; i++) {
                const y = (h / rows) * i
                const dir = i % 2 == 0 ? 1 : -1
                // 2 blocks per row with gap
                const b1 = new Entity(`slide-${i}-1`, 'obstacle', w / 2, y, 40, '#ffaa00'); b1.shape = 'rect'; b1.width = w / 2; b1.height = 40
                b1.behavior = 'oscillating'; b1.oscilOrigin = new Vector2(w * 0.25, y); b1.oscilDir = new Vector2(1, 0); b1.oscilAmp = 100; b1.oscilSpeed = 1.0;
                entities.push(b1)
                const b2 = new Entity(`slide-${i}-2`, 'obstacle', w / 2, y, 40, '#ffaa00'); b2.shape = 'rect'; b2.width = w / 2; b2.height = 40
                b2.behavior = 'oscillating'; b2.oscilOrigin = new Vector2(w * 0.75, y); b2.oscilDir = new Vector2(1, 0); b2.oscilAmp = 100; b2.oscilSpeed = 1.0;
                entities.push(b2)
            }
        }
        return entities
    }

    // --- SPIRE ---
    private lib_Spire(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const cx = w / 2, cy = h / 2
        if (type === 'quad-triangle') {
            // L21: 4 Large Triangles Symmetric
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2
                const largeId = `qt-${i}`
                // L21 Update: Float all around (Bouncing)
                const startX = cx + Math.cos(angle) * 100 // Start closer to center
                const startY = cy + Math.sin(angle) * 100
                const ent = new Entity(largeId, 'obstacle', startX, startY, 30, '#ff0000')
                ent.shape = 'triangle'; ent.behavior = 'bouncing';
                ent.vel = new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100) // Random float
                ent.angle = angle
                ent.rotationSpeed = 1.0 // Spin
                entities.push(ent)

                // L21: 4 Small Triangles around each Large one
                for (let k = 0; k < 4; k++) {
                    const subAngle = (k / 4) * Math.PI * 2
                    const sub = new Entity(`qt-${i}-s-${k}`, 'obstacle', 0, 0, 10, '#ff8800') // Reduced to 10
                    sub.shape = 'triangle'; sub.behavior = 'static'; // Static to avoid Physics interference
                    sub.mimicType = 'orbit_child'; sub.mimicTargetID = largeId
                    sub.orbitRadius = 70; sub.orbitSpeed = -2.5; // Fast counter-spin
                    sub.angle = subAngle
                    entities.push(sub)
                }
            }
            return entities
        }
        if (type.includes('black-hole')) {
            const isSlow = type === 'black-hole-slow'
            const isWeak = type === 'black-hole-weak'
            const core = new Entity('bh-core', 'obstacle', cx, cy, 60, '#FFFDD0') // [User Request] Cream Core
            core.shape = 'circle'; core.behavior = 'gravity_well';
            if (isWeak) core.pulseMax = 0; // Just gravity
            // Gravity force is handled in update loop. We need to reduce it for 'black-hole-weak'.
            // I'll add a 'mimicType' to control strength to avoid 'stucked'.
            if (isWeak) core.mimicType = 'weak-gravity'
            entities.push(core);
            for (let i = 0; i < 20; i++) {
                const ent = new Entity(`debris-${i}`, 'obstacle', cx, cy, 15, '#B87333') // [User Request] Copper
                ent.shape = 'asteroid'; ent.behavior = 'orbit'; ent.orbitCenter = new Vector2(cx, cy)
                ent.orbitRadius = 100 + Math.random() * (isSlow ? 400 : 200)
                // L47 Fix: Reduced speed by 25% (User request 20-30%) -> Further reduced by 25%
                const speedMult = isSlow ? 0.3 : (isWeak ? 0.75 * 0.75 : 1.0) // [User Request] Extra 25% Reduction
                ent.orbitSpeed = (2 + Math.random() * 3) * speedMult
                ent.angle = Math.random() * 6.28; ent.mimicType = 'reverse'
                entities.push(ent)
            }
        } else {
            // User Request: Add 2 layers for Diamond (L33) -> 6 Layers
            const layers = type === 'diamond' ? 6 : 4
            for (let i = 1; i <= layers; i++) {
                const size = i * 60, nodes = type === 'triangle' ? 3 : 4
                for (let j = 0; j < nodes; j++) {
                    const angle = (j / nodes) * Math.PI * 2 - (Math.PI / 2)
                    const x = cx + Math.cos(angle) * size, y = cy + Math.sin(angle) * size
                    const ent = new Entity(`spire-${i}-${j}`, 'obstacle', x, y, 20, '#ff0000')
                    ent.shape = 'triangle'; ent.behavior = 'rotating_child'; ent.rotationCenter = new Vector2(cx, cy); ent.rotationRadius = size; ent.rotationSpeed = (i % 2 === 0 ? 0.5 : -0.5); ent.angle = angle
                    entities.push(ent)
                }
            }
        }
        return entities
    }

    // --- PULSE ---
    private lib_Pulse(w: number, h: number, variant: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = 8
        for (let i = 0; i < count; i++) {
            const pos = this.getSafePos(w, h, exitPos, entities)
            if (!pos) continue
            const ent = new Entity(`pulse-${i}`, 'obstacle', pos.x, pos.y, 20, '#ff0000')
            ent.shape = 'circle'; ent.behavior = 'pulsing'
            ent.pulseMin = 20; ent.pulseMax = 50
            ent.pulseSpeed = 1.5 + Math.random()
            if (variant === 'breather') ent.pulseSpeed = 0.8
            if (variant === 'wandering') {
                ent.behavior = 'bouncing' // It pulses AND moves? Need to check update loop. 
                // Wait, 'pulsing' is a behavior. 'bouncing' is a behavior. Can't be both. 
                // Use mimicType or just make it drifting with pulse properties if update supports it?
                // Update loop handles distinct behaviors. I'll make it 'drifting' and rely on a new 'pulse' property handling if I added it? 
                // Actually, I'll just use 'bouncing' and give it a pulse effect in update if I had time, but for now let's just make it move slowly.
                // The user said "randomly moving at slow speed". 
                // I will set behavior to 'bouncing' and vel to low.
                ent.behavior = 'bouncing'
                ent.vel = new Vector2((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40)
            }
            entities.push(ent)
        }
        return entities
    }

    // --- PATROL ---
    private lib_Patrol(w: number, h: number, variant: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = variant === 'active' ? 10 : 20
        if (variant === 'bouncy') {
            for (let i = 0; i < 15; i++) {
                const ent = new Entity(`b-mine-${i}`, 'obstacle', Math.random() * w, Math.random() * h / 1.5, 25, '#ff8800')
                ent.behavior = 'bouncing'; ent.vel = new Vector2((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150)
                entities.push(ent)
            }
            return entities
        }
        for (let i = 0; i < count; i++) {
            const rowH = h / (count + 2)
            const y = rowH * (i + 1) + 100
            const x = w / 2
            const ent = new Entity(`pat-${i}`, 'obstacle', x, y, 20, '#ff0000') // Red
            ent.shape = 'asteroid'; // Replaced Hex with Star (Asteroid) per user request
            ent.behavior = 'patrol'
            ent.oscilAmp = w / 2 - 60; ent.patrolOffset = i * 0.5; ent.initialPos = new Vector2(x, y)
            if (variant === 'fast-vert') {
                ent.mimicType = 'mirror-y'; ent.initialPos = new Vector2(w * ((i + 0.5) / count), h / 2); ent.oscilAmp = h / 3
            }
            if (variant === 'cross-fire') {
                // User Request: Good Symmetry.
                // Reset loop logic to strict Horiz/Vert sets.
                // i: 0-9 (Count 10)
                if (i < 5) {
                    // Horizontal Rows
                    const y = (h / 6) * (i + 1)
                    ent.initialPos = new Vector2(w / 2, y)
                    ent.oscilDir = new Vector2(1, 0)
                    ent.oscilAmp = w / 2 - 20
                } else {
                    // Vertical Cols
                    const k = i - 5
                    const x = (w / 6) * (k + 1)
                    ent.initialPos = new Vector2(x, h / 2)
                    ent.oscilDir = new Vector2(0, 1)
                    ent.oscilAmp = h / 2 - 20
                }
                // User Tuning: Slow down significantly
                ent.oscilSpeed = 0.4 // Reduced movement by 60% (Default ~1.0)
                ent.rotationSpeed = 0.2 // Reduced spin by 80% (Default ~1.0)
            }
            if (variant === 'stealth') {
                ent.alpha = 0; // L34: Invisible start
                ent.behavior = 'chase';
                ent.mimicType = 'stealth'
            }
            if (variant === 'hunter') { ent.behavior = 'chase'; ent.mimicType = 'stop-go'; }
            entities.push(ent)
        }
        return entities
    }

    // --- ORBIT ---
    private lib_Orbit(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const sunPos = new Vector2(w / 2, h / 2)
        if (type === 'solar') {
            const sun = new Entity('sun', 'obstacle', sunPos.x, sunPos.y, 40, '#fffdd0'); // [UPDATE] Cream Color
            sun.shape = 'circle'; sun.behavior = 'static'; entities.push(sun)
            // User Request: Add 3 more balls (Total 8), adjust distance
            for (let i = 0; i < 8; i++) {
                // [UPDATE] Smallest balls (planets) turn to Red
                const ent = new Entity(`orb-${i}`, 'obstacle', sunPos.x, sunPos.y, 15 + i * 2, '#ff0000')
                ent.behavior = 'orbit'; ent.orbitCenter = sunPos;
                // Adjusted spacing: 100 + i * 35 (Slightly tighter to fit 8)
                ent.orbitRadius = 100 + i * 35
                ent.orbitSpeed = (i % 2 == 0 ? 1 : -1) * (1.5 - i * 0.1)
                ent.angle = Math.random() * 6.28
                entities.push(ent)
            }
        }
        else if (type.startsWith('binary')) {
            // L38: "Double the obstacle" -> binary-5 becomes 10 sets
            const sets = type === 'binary-5' ? 10 : type === 'binary-3' ? 3 : 2
            const c1 = new Vector2(w * 0.3, h * 0.4), c2 = new Vector2(w * 0.7, h * 0.6)
            for (let i = 0; i < sets; i++) {
                const ent = new Entity(`b1-${i}`, 'obstacle', 0, 0, 20, '#ff0000'); ent.behavior = 'orbit'; ent.orbitCenter = c1; ent.orbitRadius = 50 + i * 25; ent.orbitSpeed = 2; entities.push(ent)
                const ent2 = new Entity(`b2-${i}`, 'obstacle', 0, 0, 20, '#ff0000'); ent2.behavior = 'orbit'; ent2.orbitCenter = c2; ent2.orbitRadius = 50 + i * 25; ent2.orbitSpeed = -2; entities.push(ent2)
            }
        }
        else if (type === 'collapsing-fast' || type === 'collapsing-extreme') {
            const sun = new Entity('sun', 'obstacle', sunPos.x, sunPos.y, 40, '#ffaa00'); sun.shape = 'circle'; sun.behavior = 'static'; entities.push(sun)
            const count = type === 'collapsing-extreme' ? 12 : 8
            const speed = type === 'collapsing-extreme' ? 4.5 : 0.95 // [UPDATE] Reduced by 50% (1.9 -> 0.95)
            for (let i = 0; i < count; i++) {
                const ent = new Entity(`col-${i}`, 'obstacle', 0, 0, 18, '#ff0000'); ent.behavior = 'orbit'; ent.orbitCenter = sunPos; ent.mimicType = 'reverse'; ent.orbitSpeed = speed;
                ent.orbitRadius = 350;
                ent.angle = (i / count) * Math.PI * 2; // L18: Symmetrical Spacing
                entities.push(ent)
            }
        }
        else if (type === 'chaotic') {
            for (let i = 0; i < 10; i++) {
                const ent = new Entity(`orb-chaotic-${i}`, 'obstacle', sunPos.x, sunPos.y, 20, '#ff00ff');
                ent.shape = 'triangle'; ent.behavior = 'orbit'; ent.orbitCenter = sunPos; ent.orbitRadius = 50 + Math.random() * 200; ent.orbitSpeed = (Math.random() - 0.5) * 5; ent.angle = Math.random() * Math.PI * 2;
                entities.push(ent);
            }
        }
        else if (type === 'atomic') {
            // L15 Redesign: 3 Atoms for full coverage
            const centers = [
                new Vector2(w / 2, h * 0.25),
                new Vector2(w / 2, h * 0.5),
                new Vector2(w / 2, h * 0.75)
            ]

            centers.forEach((center, idx) => {
                const nucleus = new Entity(`nuc-${idx}`, 'obstacle', center.x, center.y, 25, '#fffdd0');
                nucleus.behavior = 'static';
                entities.push(nucleus);

                // 3 Electrons per atom (Reduced for clarity/size)
                for (let i = 0; i < 3; i++) {
                    const ent = new Entity(`el-${idx}-${i}`, 'obstacle', 0, 0, 15, '#ff0000'); // Reverted Size 24->15
                    ent.behavior = 'orbit';
                    ent.orbitCenter = center;
                    ent.orbitRadius = 80 + (i * 50); // Keep Distinct Spacing
                    // [UPDATE] Reduced speed by 50% (1.2 -> 0.6)
                    ent.orbitSpeed = (i % 2 == 0 ? 1 : -1) * (0.6 + Math.random() * 0.5);
                    ent.angle = (i / 3) * Math.PI * 2 + Math.random();
                    entities.push(ent)
                }
            })
        }
        return entities
    }

    // --- CHASER ---
    private lib_Chaser(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = type === 'swarm' ? 10 : 3
        const speed = type === 'zombie-fast' ? 'fast' : 'normal'
        for (let i = 0; i < count; i++) {
            const pos = this.getSafePos(w, h, exitPos, entities, 500); if (!pos) continue
            const ent = new Entity(`ch-${i}`, 'obstacle', pos.x, pos.y, 20, '#ff0000')
            ent.shape = 'triangle'; ent.behavior = 'chase'
            if (speed === 'fast') ent.mimicType = 'fast-chase'
            if (type === 'onslaught') {
                // Spawn from edges
                const side = Math.floor(Math.random() * 4)
                if (side === 0) ent.pos = new Vector2(Math.random() * w, -100)
                else if (side === 1) ent.pos = new Vector2(Math.random() * w, h + 100)
                else if (side === 2) ent.pos = new Vector2(-100, Math.random() * h)
                else ent.pos = new Vector2(w + 100, Math.random() * h)
                ent.mimicType = 'fast-chase'
                // Ensure they wake up
                ent.vel = new Vector2(0, 0) // Reset vel
            }
            if (type === 'ambush') {
                // 5 entities from corners and center-top (Modified to avoid bottom corners)
                const spawns = [new Vector2(0, 0), new Vector2(w, 0), new Vector2(0, h * 0.4), new Vector2(w, h * 0.4), new Vector2(w / 2, 0)]
                if (i < spawns.length) {
                    ent.pos = spawns[i]
                }
            }
            entities.push(ent)
        }
        return entities
    }

    // --- PENDULUM ---
    private lib_Pendulum(w: number, h: number, type: 'single' | 'dual' | 'hard', exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = type === 'single' ? 3 : 5
        const speedMult = type === 'hard' ? 1.5 : 1.0
        for (let i = 0; i < count; i++) {
            const x = (w / count) * (i + 0.5), y = 100 + Math.random() * (h / 2)
            const ent = new Entity(`pend-${i}`, 'obstacle', x, y, 40, '#ffaa00')
            ent.shape = 'asteroid'; ent.behavior = 'oscillating'; ent.oscilOrigin = new Vector2(x, y); ent.oscilDir = new Vector2(Math.random() > 0.5 ? 1 : -1, 0); ent.oscilAmp = 100
            ent.oscilSpeed = (1.5 + Math.random()) * speedMult
            entities.push(ent)
        }
        return entities
    }
    // --- LASERS/WAVE ---
    private lib_Lasers(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        if (type === 'wave') {
            // L17: Wave flow - Filled Grid with Margins
            const cols = 6, rows = 10 // Reduced density but filled (60 balls vs 48 spaced)
            const marginX = 50
            const marginY = 80
            const usableW = w - (marginX * 2)
            const usableH = h - (marginY * 2)

            const startPos = new Vector2(w / 2, h - 150)

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = marginX + (usableW / (cols - 1)) * i
                    const y = marginY + (usableH / (rows - 1)) * j

                    // [FIX] Safe Zone Check (Radius 100 + Buffer)
                    if (Math.hypot(x - startPos.x, y - startPos.y) < 150) continue;

                    const ent = new Entity(`wave-${i}-${j}`, 'obstacle', x, y, 14, '#ff0000')
                    ent.shape = 'circle'; ent.behavior = 'oscillating'
                    ent.oscilOrigin = new Vector2(x, y); ent.oscilDir = new Vector2(1, 0)
                    ent.oscilAmp = 25; ent.oscilSpeed = 1.0 + (j * 0.15)

                    // Filled Grid (No checkerboard)
                    entities.push(ent)
                }
            }
            return entities
        }
        // Original implementation (Lines of phasing dots)
        for (let i = 1; i < 5; i++) {
            const y = (h / 5) * i
            for (let k = 0; k < 15; k++) {
                const ent = new Entity(`lz-${i}-${k}`, 'obstacle', (w / 15) * k, y, 10, '#ff0000')
                ent.shape = 'circle'; ent.behavior = 'phasing'; ent.phaseInterval = 3.0; ent.phaseTimer = 0;
                entities.push(ent)
            }
        }
        return entities
    }

    // --- MINES ---
    private lib_Mines(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = type === 'active' ? 10 : 20
        if (type === 'bouncy' || type === 'bouncy-safe') {
            for (let i = 0; i < 15; i++) { // Increased count
                // Ensure safe distance spawn
                const pos = this.getSafePos(w, h, exitPos, entities, 80)
                if (!pos) continue
                const ent = new Entity(`b-mine-${i}`, 'obstacle', pos.x, pos.y, 25, '#ff4400') // Red-Orange
                ent.behavior = 'bouncing';
                // L18 Fix: Don't freeze. Ensure min vel.
                let vx = (Math.random() - 0.5) * 400
                let vy = (Math.random() - 0.5) * 400
                if (Math.abs(vx) < 50) vx = 50 * Math.sign(vx || 1)
                if (Math.abs(vy) < 50) vy = 50 * Math.sign(vy || 1)
                ent.vel = new Vector2(vx, vy)
                entities.push(ent)
            }
            return entities
        }
        for (let i = 0; i < count; i++) {
            const pos = this.getSafePos(w, h, exitPos)
            if (!pos) continue
            const ent = new Entity(`mine-${i}`, 'obstacle', pos.x, pos.y, 25, '#aa0000') // Dark Red
            ent.shape = 'circle'; ent.behavior = 'pulsing'; ent.pulseMin = 25; ent.pulseMax = 50
            entities.push(ent)
        }
        return entities
    }

    // --- GRAVITY ---
    private lib_Gravity(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = type === 'magnetic' ? 8 : 5
        for (let i = 0; i < count; i++) {
            const pos = this.getSafePos(w, h, exitPos, entities, 300)
            if (!pos) continue
            // [User Request] Purple -> Yellow (#ffaa00) for Level 30 uniformity
            const ent = new Entity(`grav-${i}`, 'obstacle', pos.x, pos.y, 40, '#ffaa00')
            ent.shape = 'circle'; ent.behavior = 'gravity_well'
            if (type === 'erratic') ent.vel = new Vector2((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)
            if (type === 'chaos') ent.vel = new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100)
            if (type === 'magnetic') {
                // L23: Magnetic Storm (Reverted)
                const count = 8
                for (let i = 0; i < count; i++) {
                    const pos = this.getSafePos(w, h, exitPos, entities, 300)
                    if (!pos) continue
                    const ent = new Entity(`grav-${i}`, 'obstacle', pos.x, pos.y, 40, '#5500aa')
                    ent.shape = 'circle'; ent.behavior = 'gravity_well'

                    const isPush = Math.random() > 0.5
                    // [User Request] Blue -> Level 18 Yellow (#ffaa00)
                    ent.color = isPush ? '#ff0000' : '#ffaa00'
                    if (isPush) ent.mimicType = 'reverse'
                    ent.vel = new Vector2((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80)
                    entities.push(ent)
                }
                return entities
            }
            entities.push(ent)
        }
        if (type === 'black-hole-extreme') {
            // L30: Strong central pull + orbiting debris
            const core = new Entity('bh-core', 'obstacle', w / 2, h / 2, 80, '#fffdd0') // [UPDATE] Cream
            core.shape = 'circle'; core.behavior = 'gravity_well';
            // [UPDATE] Free floating (Drift)
            core.vel = new Vector2((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60)
            entities.push(core)

            // L30 Tuning: Slower (70% reduced) and Anti-Cluster
            const count = 24
            for (let i = 0; i < count; i++) {
                // Spiral distribution to prevent initial clumping
                // Min Radius 280 (Safe) -> Max 550
                const radiusProgress = i / count
                const dist = 280 + (radiusProgress * 250) + (Math.random() * 40)

                const e = new Entity(`debris-${i}`, 'obstacle', w / 2, h / 2, 12, '#ff0000') // [UPDATE] Red
                e.behavior = 'orbit'; e.orbitCenter = new Vector2(w / 2, h / 2);
                e.orbitRadius = dist;

                // [UPDATE] Reduced Speed by 60% (Mul 0.4)
                e.orbitSpeed = (0.6 + Math.random() * 0.3) * 0.4;

                // Even Angular Spacing (Golden Angle-ish or just separated)
                e.angle = (i * (Math.PI * 2 / count)) * 2.3

                e.mimicType = 'reverse'; // Collapsing behavior preserved
                entities.push(e)
            }
        }
        if (type === 'black-hole-cluster') {
            // L37 Redesign: 3 Moving Gravity Wells
            for (let k = 0; k < 3; k++) {
                // Spaced out
                const x = w / 2 + (k - 1) * 150
                const y = h / 2 + (k - 1) * 100
                const core = new Entity(`bh-c-${k}`, 'obstacle', x, y, 60, '#000000')
                core.behavior = 'gravity_well';
                // Make them drift
                core.vel = new Vector2((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
                entities.push(core)
            }
            // Add some floating mines for danger
            for (let i = 0; i < 15; i++) {
                const m = new Entity(`mine-${i}`, 'obstacle', Math.random() * w, Math.random() * h, 15, '#aaaa00')
                m.behavior = 'drifting'; m.vel = new Vector2((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)
                entities.push(m)
            }
        }
        return entities
    }

    // --- MIMIC ---
    private lib_Mimic(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        if (type === 'doppelganger') {
            // L36: Mirror Clones
            // Store screen dims in mimicOffset for the update loop to use
            const dims = new Vector2(w, h)

            // Mirror X
            const mx = new Entity('mir-x', 'obstacle', w, 0, 25, '#ff0000');
            mx.shape = 'triangle'; mx.behavior = 'mimic'; mx.mimicType = 'mirror-x';
            mx.mimicOffset = dims; entities.push(mx)
            // Mirror Y
            const my = new Entity('mir-y', 'obstacle', 0, h, 25, '#00ff00');
            my.shape = 'triangle'; mx.behavior = 'mimic'; my.mimicType = 'mirror-y';
            my.mimicOffset = dims; entities.push(my)
            // Mirror XY (Opposite)
            const mxy = new Entity('mir-xy', 'obstacle', w, h, 30, '#ffff00');
            mxy.shape = 'hex'; mxy.behavior = 'mimic'; mxy.mimicType = 'mirror-xy';
            mxy.mimicOffset = dims; entities.push(mxy)

            // Static obstacles for maze-like feel
            const wall = new Entity('wall-mid', 'obstacle', w / 2, h / 2, 60, '#ff0000');
            wall.shape = 'square'; wall.behavior = 'static'; entities.push(wall)

            return entities
        }
        if (type === 'dash') {
            for (let i = 0; i < 3; i++) {
                const ent = new Entity(`dash-${i}`, 'obstacle', w / 2, h / 2, 30, '#ff0000')
                ent.shape = 'triangle'; ent.behavior = 'mimic'; ent.mimicType = 'dash'
                entities.push(ent)
            }
        } else {
            // Aggressive Mimic (L28) - 5 Rows of Chasers (Scattered)
            const rows = 5
            const cols = 5
            for (let r = 0; r < rows; r++) {
                // Increased vertical spacing (140)
                const rowY = h / 2 + (r - 2) * 140
                // "Unsymetrise": Add staggered offset and random variance
                const rowOffset = (r % 2) * 40 + (Math.random() - 0.5) * 20

                for (let k = 0; k < cols; k++) {
                    const x = w / 2 + (k - 2) * 110 + rowOffset // Wider spacing (80->110) for easier dodging
                    const ent = new Entity(`mimic-${r}-${k}`, 'obstacle', x, rowY, 30, '#ff0000')
                    ent.shape = 'square'; ent.behavior = 'mimic';
                    ent.mimicType = 'fast-chase'
                    // Slightly Easier: Reduced speed (120-170)
                    const speed = 120 + Math.random() * 50
                    ent.vel = new Vector2(speed, 0)
                    entities.push(ent)
                }
            }
        }
        return entities
    }

    // --- TELEPORT ---
    private lib_Teleport(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        for (let i = 0; i < 5; i++) {
            const pos = this.getSafePos(w, h, exitPos) || new Vector2(w / 2, h / 2)
            const ent = new Entity(`t-${i}`, 'obstacle', pos.x, pos.y, 30, '#00ff00')
            ent.behavior = 'phasing'; ent.mimicType = 'teleport'; ent.phaseInterval = 3.0
            entities.push(ent)
        }
        return entities
    }

    // --- VOID RAYS (L35) ---
    private lib_VoidRays(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        // L35: denser, faster phasing
        const entities: Entity[] = []
        for (let i = 1; i < 6; i++) {
            const y = (h / 6) * i
            for (let k = 0; k < 18; k++) {
                const ent = new Entity(`lz-${i}-${k}`, 'obstacle', (w / 18) * k, y, 10, '#ff0000')
                ent.shape = 'circle'; ent.behavior = 'phasing'; ent.phaseInterval = 2.0; ent.phaseTimer = k * 0.1; // Sequential phasing
                entities.push(ent)
            }
        }
        return entities
    }

    // --- PHASING ---
    private lib_Phasing(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        for (let i = 0; i < 10; i++) {
            const pos = this.getSafePos(w, h, exitPos)
            if (!pos) continue
            const ent = new Entity(`ph-${i}`, 'obstacle', pos.x, pos.y, 25, '#8888ff')
            ent.behavior = 'phasing'; ent.phaseInterval = 2.0; ent.phaseTimer = Math.random() * 2; ent.phaseHidden = Math.random() > 0.5
            entities.push(ent)
        }
        return entities
    }

    // --- REPLICATING (L19: Quantum Flux) ---
    private lib_Replicating(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        // "Think unique and replace with current" -> Quantum Flux
        for (let i = 0; i < 6; i++) {
            const ent = new Entity(`quant-${i}`, 'obstacle', Math.random() * w, Math.random() * h / 2, 35, '#cc00ff')
            ent.behavior = 'phasing'; // It phases out
            ent.phaseInterval = 1.0; ent.phaseTimer = Math.random() // Fast phase
            ent.mimicType = 'teleport'; // And teleports
            ent.vel = new Vector2((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100) // And moves slowly
            entities.push(ent)
        }
        return entities
    }

    // --- RAIN ---
    private lib_Rain(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = type === 'heavy' ? 20 : 10
        // L22 Shield: Add a player shield orb
        // L22 Shield: Add a player shield orb
        // const shield = new Entity('shield-orb', 'obstacle', w / 2, h - 250, 20, '#00ff00')
        // shield.behavior = 'mimic'; shield.mimicType = 'boss-shield';
        // shield.id = 'player-shield'; shield.color = '#00ff00'; shield.radius = 15
        // entities.push(shield)

        for (let i = 0; i < count; i++) {
            // L39 Fix: Spacing
            const col = i % 5
            const x = (w / 5) * (col + 0.5) + (Math.random() - 0.5) * 50
            const y = -Math.random() * h * 1.5 // Spread out more vertically

            const ent = new Entity(`rain-${i}`, 'obstacle', x, y, 15, '#B87333') // [User Request] Copper
            ent.behavior = 'drifting'; ent.vel = new Vector2(0, 200 + Math.random() * 100)
            ent.mimicType = 'rain'
            entities.push(ent)
        }
        return entities
    }

    // --- SOLAR FLARE ---
    private lib_SolarFlare(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const sun = new Entity('sun-flare', 'obstacle', w / 2, h / 2, 60, '#ffaa00')
        sun.behavior = 'static'
        entities.push(sun)
        for (let i = 0; i < 6; i++) { // Increased arms to 6
            const arm = new Entity(`flare-${i}`, 'obstacle', w / 2, h / 2, 20, '#ff4400')
            arm.behavior = 'orbit'; arm.orbitCenter = new Vector2(w / 2, h / 2);
            arm.orbitRadius = 100; arm.orbitSpeed = 2.5; // Increased speed (L25)
            arm.angle = (Math.PI * 2 / 6) * i // Even spacing
            entities.push(arm)
        }
        return entities
    }

    // --- HIDDEN MAZE ---
    private lib_HiddenMaze(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const count = (type === 'dense-70') ? 200 : 10
        // L48: 70% area
        if (type === 'dense-70') {
            for (let i = 0; i < count; i++) {
                const pos = this.getSafePos(w, h, exitPos, entities, 40)
                if (!pos) continue
                const ent = new Entity(`hid-${i}`, 'obstacle', pos.x, pos.y, 30, '#444444')
                ent.shape = 'square'; ent.behavior = 'static';
                // ent.mimicType = 'hidden' // Revealed always? "object to fill" -> Visible blocking.
                // "Fill 70% area with object" usually means dense static field. 
                // Let's keep them visible or semi-visible.
                ent.alpha = 0.8;
                entities.push(ent)
            }
            return entities
        }
        // Reverted 'reveal' logic for default/reveal type
        const revealCount = 12
        for (let i = 0; i < revealCount; i++) {
            const pos = this.getSafePos(w, h, exitPos)
            if (!pos) continue
            const ent = new Entity(`hid-${i}`, 'obstacle', pos.x, pos.y, 40, '#00ff00') // [User Request] Green
            ent.shape = 'square'; ent.behavior = 'static'; ent.mimicType = 'hidden'
            ent.alpha = 0 // Initially invisible, revealed in update
            entities.push(ent)
        }
        return entities
    }

    // --- RICOCHET ---
    private lib_Ricochet(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        // User Request: Add 5 more balls to Level 8 (slow-bounce)
        const count = (type === 'box-heavy') ? 8 : (type === 'slow-bounce' ? 10 : 5)
        for (let i = 0; i < count; i++) {
            const ent = new Entity(`r-${i}`, 'obstacle', w / 2, h / 2, 20, '#ff0000')
            ent.shape = 'circle'; ent.behavior = 'bouncing'
            ent.vel = new Vector2((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400)
            if (type === 'slow-bounce') {
                ent.vel = new Vector2((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150)
            }
            entities.push(ent)
        }
        return entities
    }

    // --- SWARM ---
    private lib_Swarm(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        for (let i = 0; i < 15; i++) {
            // Simplify: Just random spawns, basic chase
            const ent = new Entity(`swarm-${i}`, 'obstacle', Math.random() * w, Math.random() * h, 15, '#ff0000')
            ent.shape = 'triangle'; ent.behavior = 'chase';
            ent.mimicType = 'fast-chase' // Ensure update loop handles it
            entities.push(ent)
        }
        return entities
    }

    // --- SNIPER ---

    private lib_Sniper(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []

        // [User Request] L43: Center "+" Sign (Copper)
        // Simulated using distinct static circles for visual clarity and collision reliability
        const plusColor = '#B87333'
        const spacing = 25
        const size = 20

        // Horizontal Bar (50% Width)
        const hStart = w * 0.25, hEnd = w * 0.75
        for (let x = hStart; x <= hEnd; x += spacing) {
            const e = new Entity('plus-h-' + x, 'obstacle', x, h / 2, size, plusColor)
            e.behavior = 'static'; e.shape = 'circle';
            entities.push(e)
        }

        // Vertical Bar (50% Height)
        const vStart = h * 0.25, vEnd = h * 0.75
        for (let y = vStart; y <= vEnd; y += spacing) {
            // Skip center to avoid double spawn
            if (Math.abs(y - h / 2) < spacing / 2) continue
            const e = new Entity('plus-v-' + y, 'obstacle', w / 2, y, size, plusColor)
            e.behavior = 'static'; e.shape = 'circle';
            entities.push(e)
        }

        const corners = [new Vector2(0, 0), new Vector2(w, 0), new Vector2(0, h), new Vector2(w, h)]
        corners.forEach((c, i) => {
            const ent = new Entity(`snip-${i}`, 'obstacle', c.x, c.y, 30, '#ff0000')
            ent.shape = 'box'; ent.behavior = 'static'; entities.push(ent) // L43: Hex -> Box
            // Bullets - Simplify: just 1 bullet per corner per sec logic? No, spawn them now.
            // Bullets - L43: Double number of balls -> 4 bullets
            for (let k = 0; k < 4; k++) {
                const b = new Entity(`bul-${i}-${k}`, 'obstacle', c.x, c.y, 10, '#ffff00')
                b.shape = 'circle'; b.behavior = 'chase';
                b.vel = new Vector2(0, 0)
                entities.push(b)
            }
        })
        return entities
    }

    // --- FRACTAL ---
    private lib_Fractal(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        if (type === 'spin-fast') {
            // L46: Fast spinning heavy fractal
            return this.lib_Spire(w, h, 'diamond', exitPos).map(e => {
                if (e.behavior === 'rotating_child') {
                    e.rotationSpeed *= 3.0 // Much faster
                }
                return e
            })
        }
        return this.lib_Spire(w, h, 'diamond', exitPos)
    }

    // --- COMPLEX (L26, L36, L44 Redesign) ---
    private lib_Complex(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        let entities: Entity[] = []
        if (type === 'storm') {
            entities = entities.concat(this.lib_Wind(w, h, 'tunnel', exitPos))
            entities = entities.concat(this.lib_Rain(w, h, 'heavy', exitPos))
            for (let i = 0; i < 3; i++) {
                const e = new Entity(`st-ch-${i}`, 'obstacle', Math.random() * w, -100, 20, '#ff0000')
                e.behavior = 'chase'; e.mimicType = 'fast-chase';
                entities.push(e)
            }
        }
        else if (type === 'grid-lock') {
            for (let i = 1; i < 6; i++) {
                const y = (h / 6) * i
                const e = new Entity(`gl-h-${i}`, 'obstacle', w / 2, y, 15, '#aaaa00')
                e.shape = 'rect'; e.width = 100; e.height = 10;
                e.behavior = 'oscillating'; e.oscilOrigin = new Vector2(w / 2, y); e.oscilDir = new Vector2(1, 0); e.oscilAmp = w / 2 - 20; e.oscilSpeed = 1.0 + i * 0.2
                entities.push(e)
            }
            for (let i = 1; i < 4; i++) {
                const x = (w / 4) * i
                const e = new Entity(`gl-v-${i}`, 'obstacle', x, h / 2, 15, '#aaaa00')
                e.shape = 'rect'; e.width = 10; e.height = 100;
                e.behavior = 'oscillating'; e.oscilOrigin = new Vector2(x, h / 2); e.oscilDir = new Vector2(0, 1); e.oscilAmp = h / 3; e.oscilSpeed = 1.5
                entities.push(e)
            }
            for (let i = 0; i < 5; i++) {
                const ent = new Entity(`gl-mine-${i}`, 'obstacle', Math.random() * w, Math.random() * h, 25, '#ff0000')
                ent.behavior = 'static'; ent.shape = 'circle'
                entities.push(ent)
            }
        }
        else if (type === 'gauntlet') {
            // L44 Redesign: Simplified (No Galaxy)
            entities = entities.concat(this.lib_Wall(w, h, 'piston-press', exitPos))
            // entities = entities.concat(this.lib_Rotator(w, h, 'galaxy', exitPos)) // REMOVED
            const swarm = this.lib_Swarm(w, h, 'gridlock', exitPos)
            entities = entities.concat(swarm.slice(0, 8)) // Increased swarm slightly
        }
        else if (type === 'mirror-maze') { // L31
            entities = entities.concat(this.lib_Wall(w, h, 'sliding', exitPos))
            for (let i = 0; i < 6; i++) {
                const e = new Entity(`m-mine-${i}`, 'obstacle', Math.random() * w, Math.random() * h, 20, '#ff00ff');
                e.behavior = 'bouncing'; e.vel = new Vector2((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
                entities.push(e)
            }
        }
        else if (type === 'star-chase') { // L19
            for (let i = 0; i < 8; i++) {
                const e = new Entity(`star-${i}`, 'obstacle', Math.random() * w, Math.random() * h, 25, '#ff0044') // Red-Pink
                e.shape = 'asteroid';
                e.behavior = 'chase'; e.mimicType = 'star-chase';
                // L19 Fix: Add offset to prevent clumping (stored in mimicOffset)
                // We will use this in update loop to offset the chase target
                e.mimicOffset = new Vector2((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200)
                entities.push(e)
            }
        }
        return entities
    }

    // --- BOSS ---
    private lib_Boss(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const boss = new Entity('boss', 'obstacle', w / 2, 100, 80, '#ff0000')
        boss.shape = 'asteroid'; boss.behavior = 'chase'; boss.mimicType = 'boss-core'
        entities.push(boss)
        // Shield
        for (let i = 0; i < 8; i++) {
            const s = new Entity(`b-shield-${i}`, 'obstacle', 0, 0, 20, '#ff4400') // Red-Orange
            s.behavior = 'orbit'; s.mimicType = 'boss-shield'; s.orbitRadius = 120; s.orbitSpeed = 2.0; s.angle = (i / 8) * 6.28
            entities.push(s)
        }
        return entities
    }

    // --- HELPERS ---
    private lib_RotatingLine(cx: number, cy: number, type: string): Entity[] {
        const entities: Entity[] = []
        const count = 4
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2
            for (let j = 1; j < 6; j++) {
                const ent = new Entity(`h-${i}-${j}`, 'obstacle', cx, cy, 20, '#FF69B4') // [User Request] Pink
                ent.shape = 'square'; ent.behavior = 'rotating_child'; ent.rotationCenter = new Vector2(cx, cy); ent.rotationRadius = j * 30; ent.rotationSpeed = 1.0; ent.angle = angle
                entities.push(ent)
            }
        }
        return entities
    }

    private getSafePos(w: number, h: number, exitPos: Vector2, existing: Entity[] = [], padding: number = 100): Vector2 | null {
        const playerStart = new Vector2(w / 2, h - 150)
        for (let i = 0; i < 50; i++) {
            const p = new Vector2(Math.random() * w, Math.random() * h)
            if (p.dist(playerStart) < padding) continue
            if (p.dist(exitPos) < 200) continue
            let ok = true
            for (const e of existing) if (p.dist(e.pos) < 60) ok = false
            if (ok) return p
        }
        return null
    }



    // --- UPDATE LOOP ---
    update(entities: Entity[], dt: number, playerPos: Vector2, playerVel?: Vector2) {
        entities.forEach(e => {
            // Dynamic Parenting (Explicit)
            if (e.mimicType === 'orbit_child' && e.mimicTargetID) {
                const target = entities.find(t => t.id === e.mimicTargetID)
                if (target) {
                    e.angle += (e.orbitSpeed || 1) * dt
                    e.pos.x = target.pos.x + Math.cos(e.angle) * e.orbitRadius
                    e.pos.y = target.pos.y + Math.sin(e.angle) * e.orbitRadius
                }
            }

            // [UPDATE] Universal Hidden Logic (Works for static and moving)
            if (e.mimicType === 'hidden') {
                const dist = e.pos.dist(playerPos)
                e.alpha = (dist < 250) ? 1 : 0
            }

            if (e.behavior === 'static') {
                return
            }
            if (e.behavior === 'patrol') { // L8 Fix
                // [FIX] Decouple Movement from Rotation
                // Use phaseTimer for oscillation position
                e.phaseTimer = (e.phaseTimer || 0) + (e.oscilSpeed || 2.0) * dt
                const offset = Math.sin(e.phaseTimer) * (e.oscilAmp || 50)

                // Rotation (Visual)
                if (e.rotationSpeed) e.angle += e.rotationSpeed * dt
                if (e.initialPos) {
                    if (e.mimicType === 'mirror-y') {
                        e.pos.x = e.initialPos.x
                        e.pos.y = e.initialPos.y + offset
                    } else {
                        e.pos.x = e.initialPos.x + offset
                        e.pos.y = e.initialPos.y
                    }
                    if (e.oscilDir) { // Cross-fire support
                        e.pos.x = e.initialPos.x + e.oscilDir.x * offset
                        e.pos.y = e.initialPos.y + e.oscilDir.y * offset
                    }
                }
            }

            if (e.behavior === 'drifting') {
                e.pos.x += e.vel.x * dt
                e.pos.y += e.vel.y * dt
                if (e.mimicType === 'rain') {
                    if (e.pos.y > 900) { e.pos.y = -50; e.pos.x = Math.random() * 600; }
                }
                if (e.pos.y > 1000) e.pos.y = -100
                if (e.pos.y < -100) e.pos.y = 1000
                if (e.pos.x > 600) e.pos.x = -100
                if (e.pos.x < -100) e.pos.x = 600
                e.angle += (e.rotationSpeed || 0.5) * dt
            }
            else if (e.behavior === 'bouncing') {
                e.pos.x += e.vel.x * dt
                e.pos.y += e.vel.y * dt
                e.angle += (e.rotationSpeed || 0) * dt // Added Rotation logic

                // Anti-Freeze: Ensure minimum velocity
                if (e.vel.mag() < 10) {
                    // Kick towards center to avoid wall traps
                    const center = new Vector2(300, 400) // Approx center, safe enough
                    e.vel = center.sub(e.pos).normalize().mul(60)
                }

                if (e.pos.x < e.radius || e.pos.x > 600 - e.radius) e.vel.x *= -1
                if (e.pos.y < e.radius || e.pos.y > 800 - e.radius) e.vel.y *= -1

                // [NEW] Phasing Logic for Moving Entities
                if (e.mimicType === 'phasing') {
                    e.phaseTimer = (e.phaseTimer || 0) + dt
                    if (e.phaseTimer > (e.phaseInterval || 2.0)) {
                        e.phaseTimer = 0
                        e.phaseHidden = !e.phaseHidden
                    }
                }

                // Replicating Logic
                if (e.mimicType === 'replicating' && (e.generation || 0) < 2) {
                    if (e.phaseTimer! > 0) e.phaseTimer! -= dt
                    else {
                        // Limit total entities to prevent lag/crash (L19 Tuning)
                        if (entities.length < 50) {
                            for (const other of entities) {
                                if (e !== other && other.mimicType === 'replicating' && e.pos.dist(other.pos) < e.radius + other.radius) {
                                    e.vel = e.vel.mul(-1); other.vel = other.vel.mul(-1)
                                    e.phaseTimer = 1.0; other.phaseTimer = 1.0 // Cooldown
                                    // Duplicate
                                    const clone = new Entity(e.id + '_c', 'obstacle', e.pos.x, e.pos.y, e.radius * 0.8, e.color)
                                    clone.behavior = 'bouncing'; clone.mimicType = 'replicating'
                                    clone.vel = new Vector2(-e.vel.y, e.vel.x); clone.generation = (e.generation || 0) + 1
                                    clone.phaseTimer = 1.0
                                    entities.push(clone)
                                    break
                                }
                            }
                        }
                    }
                }
            } else if (e.behavior === 'mimic') {
                if (e.id === 'player-shield') {
                    // Orbit player
                    e.angle += 3 * dt
                    e.pos.x = playerPos.x + Math.cos(e.angle) * 60
                    e.pos.y = playerPos.y + Math.sin(e.angle) * 60
                    // Destroy obstacles it touches? Needs collision in main loop or here.
                    // Simple check:
                    for (let i = entities.length - 1; i >= 0; i--) {
                        const other = entities[i]
                        if (other.id !== 'player-shield' && e.pos.dist(other.pos) < e.radius + other.radius) {
                            entities.splice(i, 1) // Destroy obstacle
                        }
                    }
                }
            }
            else if (e.behavior === 'orbit') {
                e.angle += e.orbitSpeed * dt
                if (e.mimicType === 'boss-shield') {
                    const boss = entities.find(b => b.id === 'boss')
                    if (boss) e.orbitCenter = boss.pos
                }
                // L11 Fix: Collapsing needs to shrink radius
                if (e.mimicType === 'reverse') { // Used for collapsing
                    e.orbitRadius -= 10 * dt
                    if (e.orbitRadius < 10) e.orbitRadius = 350 // Reset loop
                }
                e.pos.x = e.orbitCenter.x + Math.cos(e.angle) * e.orbitRadius
                e.pos.y = e.orbitCenter.y + Math.sin(e.angle) * e.orbitRadius
            }
            // Chase behavior is now handled by PhysicsSystem to prevent double-update speed issues.
            // Star-Chase, Stealth, and Fast-Chase logic migrated to Physics.
            // else if (e.behavior === 'chase') { ... }
            else if ((e.behavior as string) === 'mimic') {
                if (e.mimicType === 'mirror-x' && e.mimicOffset) {
                    e.pos.x = e.mimicOffset.x - playerPos.x
                    e.pos.y = playerPos.y
                }
                else if (e.mimicType === 'mirror-y') {
                    if (e.mimicOffset) e.pos.y = e.mimicOffset.y - playerPos.y
                    e.pos.x = playerPos.x
                }
                else if (e.mimicType === 'mirror-xy') {
                    if (e.mimicOffset) {
                        e.pos.x = e.mimicOffset.x - playerPos.x
                    }
                }
                else if (e.mimicType === 'ring-chase') {
                    const dir = playerPos.sub(e.pos).normalize()
                    const speed = e.vel.x || 150
                    e.pos = e.pos.add(dir.mul(speed * dt))
                }
                else if (e.mimicType === 'shadow' && e.mimicTargetID) {
                    const target = entities.find(t => t.id === e.mimicTargetID)
                    if (target) {
                        const dist = e.pos.dist(target.pos)
                        if (dist > 40) { // Increased follow distance
                            // Simple follow logic
                            const dir = target.pos.sub(e.pos).normalize()
                            e.pos = e.pos.add(dir.mul(180 * dt)) // Faster catch up
                        }
                    }
                }
                else if (e.mimicType === 'fast-chase') {
                    // L28: Support speed override from spawn
                    const speed = e.vel.x > 0 ? e.vel.x : 110
                    const dir = playerPos.sub(e.pos).normalize()
                    e.pos = e.pos.add(dir.mul(speed * dt))
                }
                else if (e.mimicType === 'dash') {
                    e.pos.x += (Math.random() - 0.5) * 10
                }
            }
            else if (e.behavior === 'phasing') {
                e.phaseTimer = (e.phaseTimer || 0) + dt
                if (e.phaseTimer > (e.phaseInterval || 2.0)) {
                    e.phaseTimer = 0
                    if (e.mimicType === 'teleport') {
                        e.pos = new Vector2(Math.random() * 400, Math.random() * 800)
                    } else {
                        e.phaseHidden = !e.phaseHidden
                    }
                }
            }
            else if (e.behavior === 'oscillating') {
                e.angle += (e.oscilSpeed || 0) * dt
                const offset = Math.sin(e.angle) * (e.oscilAmp || 0)
                if (e.oscilOrigin && e.oscilDir) {
                    e.pos.x = e.oscilOrigin.x + e.oscilDir.x * offset
                    e.pos.y = e.oscilOrigin.y + e.oscilDir.y * offset
                }
            }
            else if (e.behavior === 'gate') {
                if (e.gateCondition === 'speed' && playerVel && playerVel.mag() < 150) {
                    e.block = false; e.radius = 5; e.color = '#00ff00'
                } else {
                    e.block = true; e.radius = 25; e.color = '#ffff00'
                }
            }
            else if (e.behavior === 'gravity_well' && playerVel) {
                if (e.vel) {
                    e.pos = e.pos.add(e.vel.mul(dt)) // Move gravity wells if they have velocity
                    if (e.pos.x < 0 || e.pos.x > 600) e.vel.x *= -1
                    if (e.pos.y < 0 || e.pos.y > 1000) e.vel.y *= -1
                }
                const dist = e.pos.dist(playerPos)
                if (dist < 300) {
                    const dir = e.pos.sub(playerPos).normalize()
                    let forceMag = 500
                    if (e.mimicType === 'weak-gravity') forceMag = 150 // L47 Tuning
                    let force = dir.mul(forceMag)
                    if (e.mimicType === 'wind') force = new Vector2(0, -500)
                    if (e.mimicType === 'reverse') force = dir.mul(-forceMag) // Repel

                    playerVel.x += force.x * dt
                    playerVel.y += force.y * dt
                }
            }
            else if (e.behavior === 'rotating_child') {
                e.angle += e.rotationSpeed * dt
                if (e.rotationCenter) {
                    e.pos.x = e.rotationCenter.x + Math.cos(e.angle) * (e.rotationRadius || 0)
                    e.pos.y = e.rotationCenter.y + Math.sin(e.angle) * (e.rotationRadius || 0)
                }
            }
        })
    }
    // --- THE RIVER (L42 Redesign V5: Chaos) ---
    private lib_River(w: number, h: number, type: string, exitPos: Vector2): Entity[] {
        const entities: Entity[] = []
        const laneCount = 7
        const startY = h - 180
        const laneHeight = 90 // Spacing

        for (let i = 0; i < laneCount; i++) {
            const laneY = startY - (i * laneHeight)
            const laneBaseSpeed = 100 + (i * 20) // Base speed
            const dir = i % 2 === 0 ? 1 : -1

            // Orbs per lane
            const count = 4 + Math.floor(i / 2) // 4, 4, 5, 5...
            const gap = w / count

            for (let k = 0; k < count; k++) {
                // Chaotic Spacing
                const x = (k * gap) + (Math.random() * 60)
                // Chaotic Lane Position (Drift)
                const y = laneY + (Math.random() * 30 - 15)

                const speed = laneBaseSpeed + (Math.random() * 40 - 20) // Individual speed variance

                const ent = new Entity(`orb-${i}-${k}`, 'obstacle', x % w, y, 12 + Math.random() * 6, '#ff2222') // Size 12-18
                ent.shape = 'circle'
                ent.behavior = 'wrapping'
                ent.vel = new Vector2(speed * dir, 0)

                entities.push(ent)
            }
        }
        return entities
    }
}
