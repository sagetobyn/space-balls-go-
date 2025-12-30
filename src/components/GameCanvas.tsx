import React, { useEffect, useRef } from 'react'
import { useGameLoop } from '../hooks/useGameLoop'
import { PhysicsSystem } from '../core/Physics'
import { Renderer } from '../core/Renderer'
import { InputHandler } from '../core/Input'
import { Entity } from '../core/Entity'
import { ruleManager } from '../rules/RuleManager'
import { NormalMovement } from '../rules/definitions/NormalMovement'
import { ParticleSystem } from '../core/ParticleSystem'

import { LevelSequenceV2 } from '../rules/LevelSequence'

// ...

interface GameCanvasProps {
    level: number;
    paused: boolean;
    onWin?: () => void;
    onLose?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ level, paused, onWin, onLose: _onLose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rendererRef = useRef<Renderer | null>(null)
    const physicsRef = useRef<PhysicsSystem | null>(null)
    const inputRef = useRef<InputHandler | null>(null)
    const entitiesRef = useRef<Entity[]>([])
    const particlesRef = useRef<ParticleSystem>(new ParticleSystem())

    // Derived Rule Info
    const currentRuleId = LevelSequenceV2[level - 1]

    // (Removed duplicate game loop - see main game loop below)

    // Sync Level active rule
    useEffect(() => {
        if (currentRuleId) {
            ruleManager.setActive(currentRuleId)

            // Reset Entities for new level
            if (canvasRef.current) {
                const width = canvasRef.current.width
                const height = canvasRef.current.height

                // Player: Cyan (#00ffff)
                const dot = new Entity('player', 'dot', width / 2, height / 2, 10, '#00ffff', 'circle')

                // Exit: Magenta (#ff00ff)
                const exitX = width * 0.8
                const exitY = height * 0.2
                const exit = new Entity('exit', 'exit', exitX, exitY, 15, '#ff00ff', 'circle')

                entitiesRef.current = [dot, exit]
            }
        }
    }, [level, currentRuleId])

    // Initialize systems
    useEffect(() => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current

        // Set size
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        rendererRef.current = new Renderer(canvas.getContext('2d')!, canvas.width, canvas.height)
        physicsRef.current = new PhysicsSystem(canvas.width, canvas.height)
        inputRef.current = new InputHandler(canvas)

        // Register Rules
        ruleManager.register(new NormalMovement())


        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth
                canvasRef.current.height = window.innerHeight
                if (rendererRef.current) {
                    rendererRef.current.width = window.innerWidth
                    rendererRef.current.height = window.innerHeight
                }
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const activeRuleIdRef = useRef<string | null>(null)

    // Game Loop
    useGameLoop((dt) => {
        if (paused) return // PAUSE LOGIC

        if (!rendererRef.current || !physicsRef.current || !inputRef.current || !canvasRef.current) return

        const activeRule = ruleManager.getActive()
        if (!activeRule) return

        const context = {
            entities: entitiesRef.current,
            bounds: { width: canvasRef.current.width, height: canvasRef.current.height }
        }

        // Handle Rule Change Lifecycle
        if (activeRule.id !== activeRuleIdRef.current) {
            if (activeRuleIdRef.current) {
                const prevRule = ruleManager.getContent(activeRuleIdRef.current)
                prevRule?.onExit?.(context)
            }
            activeRule.onEnter?.(context)
            activeRuleIdRef.current = activeRule.id
        }

        // Input Phase
        const delta = inputRef.current.getDelta()

        // Apply input to player
        const player = entitiesRef.current.find(e => e.type === 'dot')
        if (player) {
            const INPUT_FORCE = 60

            player.vel = player.vel.add(activeRule.modifyInput(delta.mul(INPUT_FORCE), dt, { isDown: inputRef.current.isDown }))
            // Friction and Limit handled by activeRule.onUpdate
        }

        // Physics Phase
        physicsRef.current.update(entitiesRef.current, activeRule, dt, context)

        // Update Particles
        particlesRef.current.update(dt)

        // Render Phase
        rendererRef.current.clear()

        let camera = { scale: 1, rotation: 0, offset: { x: 0, y: 0 } as any }
        camera = activeRule.modifyCamera(camera, dt)

        rendererRef.current.setCamera(camera)
        rendererRef.current.applyCamera()

        // Draw Particles
        const ctx = rendererRef.current.ctx
        particlesRef.current.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2)
            ctx.fill()
        })
        ctx.globalAlpha = 1.0

        entitiesRef.current.forEach(e => {
            if (e.id !== 'player') rendererRef.current!.drawEntity(e)
        })
        const playerEntity = entitiesRef.current.find(e => e.id === 'player')
        if (playerEntity) rendererRef.current!.drawEntity(playerEntity)
        activeRule.onRender?.(rendererRef.current.ctx, rendererRef.current.width, rendererRef.current.height)

        // Check Win Condition
        const exit = entitiesRef.current.find(e => e.type === 'exit')
        if (playerEntity && exit) {
            if (playerEntity.pos.dist(exit.pos) < playerEntity.radius + exit.radius) {
                // WIN Visuals
                particlesRef.current.spawn(playerEntity.pos.x, playerEntity.pos.y, 20, '#00ffff')
                particlesRef.current.spawn(exit.pos.x, exit.pos.y, 20, '#ff00ff')

                // WIN Logic
                playerEntity.vel.x = 0; playerEntity.vel.y = 0;
                onWin?.()
            }
        }
    })

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full block touch-none"
        />
    )
}
