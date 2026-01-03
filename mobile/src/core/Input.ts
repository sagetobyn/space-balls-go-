import { Vector2 } from './Vector2'

export class InputHandler {
    isDown: boolean = false
    startPos: Vector2 = new Vector2(0, 0)
    currentPos: Vector2 = new Vector2(0, 0)
    lastPos: Vector2 = new Vector2(0, 0)
    accumulatedDelta: Vector2 = new Vector2(0, 0)

    // No constructor listeners
    constructor() { }

    public onStart(x: number, y: number) {
        this.isDown = true
        this.startPos = new Vector2(x, y)
        this.currentPos = new Vector2(x, y)
        this.lastPos = new Vector2(x, y)
        this.accumulatedDelta = new Vector2(0, 0)
    }

    public onMove(x: number, y: number) {
        if (!this.isDown) return

        // Calculate the small movement since last update
        const newPos = new Vector2(x, y)
        const moveDelta = newPos.sub(this.currentPos)

        // Add to accumulation buffer
        this.accumulatedDelta = this.accumulatedDelta.add(moveDelta)

        // Cap the accumulated delta to prevent excessive speed during fast sweeping
        const MAX_DELTA = 15 // Maximum pixels of movement per frame
        const mag = this.accumulatedDelta.mag()
        if (mag > MAX_DELTA) {
            this.accumulatedDelta = this.accumulatedDelta.normalize().mul(MAX_DELTA)
        }

        // Update positions (for x/y getters and drag vector)
        this.lastPos = this.currentPos
        this.currentPos = newPos
    }

    public onEnd() {
        this.isDown = false
        this.accumulatedDelta = new Vector2(0, 0)
    }

    getDragVector(): Vector2 {
        if (!this.isDown) return new Vector2(0, 0)
        return this.currentPos.sub(this.startPos)
    }

    getDelta(): Vector2 {
        // Return accumulated movement and RESET it
        // This ensures force is applied exactly once per touch move event
        const delta = this.accumulatedDelta
        this.accumulatedDelta = new Vector2(0, 0)
        return delta
    }

    get x(): number { return this.currentPos.x }
    get y(): number { return this.currentPos.y }
}
