import { Vector2 } from './Vector2'

export type EntityType = 'dot' | 'exit' | 'wall' | 'obstacle'

export class Entity {
    id: string
    type: EntityType
    pos: Vector2
    vel: Vector2
    radius: number
    color: string
    shape: 'circle' | 'square'

    constructor(id: string, type: EntityType, x: number, y: number, radius: number, color: string, shape: 'circle' | 'square' = 'circle') {
        this.id = id
        this.type = type
        this.pos = new Vector2(x, y)
        this.vel = new Vector2(0, 0)
        this.radius = radius
        this.color = color
        this.shape = shape
    }

    update(dt: number) {
        this.pos = this.pos.add(this.vel.mul(dt))
    }
}
