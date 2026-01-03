import { Vector2 } from './Vector2'

export type EntityType = 'dot' | 'exit' | 'wall' | 'obstacle' | 'orb' // [NEW] Orb added

export type ShapeType = 'circle' | 'square' | 'hex' | 'triangle' | 'asteroid' | 'box' | 'rect' | 'ring'
export type BehaviorType = 'static' | 'orbit' | 'patrol' | 'chase' | 'pulsing' | 'rotating_child' | 'oscillating' | 'gate' | 'following' | 'drifting' | 'phasing' | 'stream' | 'mimic' | 'gravity_well' | 'bouncing' | 'wrapping' | 'mirror_player'
export type MimicType = 'mirror-x' | 'mirror-y' | 'mirror-xy' | 'stop-go' | 'reverse' | 'shadow' | 'wind' | 'boss-core' | 'boss-shield' | 'dash' | 'teleport' | 'hidden' | 'fast-chase' | 'ring-chase' | 'stealth' | 'replicating' | 'rain' | 'weak-gravity' | 'star-chase' | 'wind-accelerator' | 'ellipse' | 'phasing' | 'orbit_child'

export class Entity {
    id: string
    type: EntityType
    pos: Vector2
    vel: Vector2
    radius: number
    width: number = 0
    height: number = 0
    color: string
    alpha: number = 1
    generation?: number = 0
    collected?: boolean = false // [NEW] Track collection status

    // AI State
    initialPos?: Vector2
    oscilOrigin?: Vector2
    oscilDir?: Vector2
    oscilAmp?: number
    oscilSpeed?: number

    // Core properties (Restored)
    shape: ShapeType = 'circle'
    behavior: BehaviorType = 'static'
    angle: number = 0

    // Orbit defaults (Non-optional to fix lint)
    orbitCenter: Vector2 = new Vector2(0, 0)
    orbitRadius: number = 0
    orbitSpeed: number = 0

    patrolOffset?: number

    // Dynamic Properties
    pulseMin?: number
    pulseMax?: number
    pulseSpeed?: number

    rotationCenter: Vector2 = new Vector2(0, 0)
    rotationSpeed: number = 0
    rotationRadius: number = 0

    // Gates
    gateCondition?: 'speed' | 'touch' | 'time'
    gateOpenSpeed?: number
    gateOneShot?: boolean

    floatSpeed?: number
    reactDistance?: number
    frequencyOffset?: number

    // V2 Library Properties
    phaseTimer?: number = 0
    phaseInterval?: number = 1.0
    phaseHidden?: boolean = false
    time?: number // [NEW] For time-based behaviors

    mimicType?: MimicType
    mimicTargetID?: string
    block?: boolean
    mimicOffset?: Vector2
    history?: Vector2[]

    streamTarget?: Vector2
    streamSpeed?: number



    constructor(id: string, type: EntityType, x: number, y: number, radius: number, color: string) {
        this.id = id
        this.type = type
        this.pos = new Vector2(x, y)
        this.initialPos = new Vector2(x, y) // Track start
        this.vel = new Vector2(0, 0)
        this.radius = radius
        this.color = color
    }

    // Helper for phasing visibility
    get isVisible(): boolean {
        if (this.behavior === 'phasing' && this.phaseHidden) return false
        return true
    }

    update(dt: number) {
        // Base physics here, but logic often moved to PhysicsSystem or Managers
        this.pos = this.pos.add(this.vel.mul(dt))
    }
}
