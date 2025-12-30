import { Vector2 } from './Vector2'

export class InputHandler {
    isDown: boolean = false
    startPos: Vector2 = new Vector2(0, 0)
    currentPos: Vector2 = new Vector2(0, 0)
    lastPos: Vector2 = new Vector2(0, 0)
    accumulatedDelta: Vector2 = new Vector2(0, 0)

    constructor(canvas: HTMLCanvasElement) {
        this.setupListeners(canvas)
    }

    private setupListeners(canvas: HTMLCanvasElement) {
        // Mouse
        canvas.addEventListener('mousedown', (e) => this.onStart(e.clientX, e.clientY))
        window.addEventListener('mousemove', (e) => this.onMove(e.clientX, e.clientY))
        window.addEventListener('mouseup', () => this.onEnd())

        // Touch
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.onStart(e.touches[0].clientX, e.touches[0].clientY)
        }, { passive: false })

        window.addEventListener('touchmove', (e) => {
            e.preventDefault()
            this.onMove(e.touches[0].clientX, e.touches[0].clientY)
        }, { passive: false })

        window.addEventListener('touchend', () => this.onEnd())
    }

    private onStart(x: number, y: number) {
        this.isDown = true
        this.startPos = new Vector2(x, y)
        this.currentPos = new Vector2(x, y)
        this.lastPos = new Vector2(x, y)
        this.accumulatedDelta = new Vector2(0, 0)
    }

    private onMove(x: number, y: number) {
        if (!this.isDown) return

        // Calculate the small movement since last event
        const newPos = new Vector2(x, y)
        const moveDelta = newPos.sub(this.currentPos)

        // Add to accumulation buffer
        this.accumulatedDelta = this.accumulatedDelta.add(moveDelta)

        // Update positions
        this.lastPos = this.currentPos
        this.currentPos = newPos
    }

    private onEnd() {
        this.isDown = false
        this.accumulatedDelta = new Vector2(0, 0)
    }

    getDragVector(): Vector2 {
        if (!this.isDown) return new Vector2(0, 0)
        return this.currentPos.sub(this.startPos)
    }

    getDelta(): Vector2 {
        // Return accumulated movement and RESET it
        // This ensures force is applied exactly once per mouse move
        const delta = this.accumulatedDelta
        this.accumulatedDelta = new Vector2(0, 0)
        return delta
    }
}
