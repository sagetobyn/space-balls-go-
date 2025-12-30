import { Entity } from './Entity'
import { Vector2 } from './Vector2'

export interface CameraView {
    scale: number
    rotation: number
    offset: Vector2
}

export class Renderer {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    camera: CameraView = { scale: 1, rotation: 0, offset: new Vector2(0, 0) }

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx
        this.width = width
        this.height = height
    }

    setCamera(camera: CameraView) {
        this.camera = camera
    }

    resize(width: number, height: number) {
        this.width = width
        this.height = height
        // Build gradients or buffers here if needed
    }

    clear() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0) // Identity
        this.ctx.fillStyle = '#0a0a0a'
        this.ctx.fillRect(0, 0, this.width, this.height)
    }

    applyCamera() {
        const cx = this.width / 2
        const cy = this.height / 2

        this.ctx.translate(cx, cy)
        this.ctx.scale(this.camera.scale, this.camera.scale)
        this.ctx.rotate(this.camera.rotation)
        this.ctx.translate(-cx, -cy)
        this.ctx.translate(this.camera.offset.x, this.camera.offset.y)
    }

    drawEntity(entity: Entity) {
        this.ctx.beginPath()

        // Enhanced Glow
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = entity.color

        this.ctx.fillStyle = entity.color

        if (entity.shape === 'square') {
            // Draw centered square
            // radius acts as half-size
            const size = entity.radius * 2
            this.ctx.rect(entity.pos.x - entity.radius, entity.pos.y - entity.radius, size, size)
        } else {
            // Circle
            this.ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2)
        }

        this.ctx.fill()

        // Inner highlight for premium feel
        this.ctx.shadowBlur = 0
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        this.ctx.closePath()
    }

    drawTrail(path: Vector2[], color: string) {
        if (path.length < 2) return

        this.ctx.beginPath()
        this.ctx.moveTo(path[0].x, path[0].y)
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x, path[i].y)
        }
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = 2
        this.ctx.globalAlpha = 0.3
        this.ctx.stroke()
        this.ctx.globalAlpha = 1.0
    }
}
