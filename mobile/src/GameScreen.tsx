import { View, Text, StyleSheet, Dimensions, Platform, PanResponder, Animated, Alert, TouchableOpacity, BackHandler } from 'react-native'
import { GLView } from 'expo-gl'
import { Renderer } from './core/Renderer'
import { PhysicsSystem } from './core/Physics'
import { InputHandler } from './core/Input'
import { ParticleSystem } from './core/ParticleSystem'
import { Entity } from './core/Entity'
import { Vector2 } from './core/Vector2'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useGameStore } from './store/gameStore'
import { ObstacleManager } from './core/ObstacleManager'
import { AudioManager } from './core/AudioManager'
import { ruleManager } from './rules/RuleManager'
import { MusicManager } from './core/MusicManager' // [NEW]
import { AdManager } from './core/AdManager' // [NEW] Ads
import { LevelSequenceV2, LevelDef } from './rules/LevelSequence'
import { Button } from './components/ui/Button'
import {
    LevelFailedOverlay,
    GameCompleteScreen,
    GamePauseOverlay,
    LevelCompleteOverlay,
    LevelStartSequence
} from './components'
import registerRules from './rules/registerRules' // [NEW]

const spawnEntities = (width: number, height: number, level: number, obstacleConfig: any): Entity[] => {
    const safeZone = 100
    const startY = height - 150

    const entities: Entity[] = []

    // 1. Exit (Goal) - Created FIRST for Obstacle Dependency
    const exitX = width / 2 + (Math.random() - 0.5) * (width * 0.8)
    const exitY = 100 + Math.random() * 100
    // Constructor: id, type, x, y, radius, color
    const exit = new Entity('exit_1', 'exit', exitX, exitY, 22, '#ff00ff')
    entities.push(exit)

    // 2. Obstacles
    const obsManager = new ObstacleManager()
    // spawn(level, width, height, exitPos, config)
    const levelObs = obsManager.spawn(level, width, height, exit.pos, obstacleConfig)
    entities.push(...levelObs)

    // 3. Player (Pink Dot)
    const player = new Entity('player_1', 'dot', width / 2, startY, 14, '#ff00ff')
    entities.push(player)

    // 4. Safe Start Ring (The Golden Circle)
    // Uses 'orb' type to be safe from collision logic
    const ring = new Entity('safe_ring', 'orb', width / 2, startY, 35, '#FFD700') // [RESTORE] Gold Ring (Reduced Size)
    ring.shape = 'ring'; // [FIX] Revert to Outline for clarity
    ring.behavior = 'static';
    ring.alpha = 0.1; // [FIX] 10% Visibility
    entities.push(ring)

    return entities
}

export default function GameScreen({ onBack, onQuitToMenu }: { onBack?: () => void, onQuitToMenu?: () => void }) {
    // Refs
    // [FIX] GL Safety Refs
    const glRef = useRef<any>(null)
    const runningRef = useRef(true)

    // [FIX] Cleanup GL on unmount
    useEffect(() => {
        return () => {
            runningRef.current = false
            glRef.current = null
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [])

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (onBack) {
                onBack()
                return true // Prevent default behavior (exit app)
            }
            return false
        })
        return () => backHandler.remove()
    }, [onBack])

    const rendererRef = useRef<Renderer | null>(null)
    const physicsRef = useRef<PhysicsSystem | null>(null)
    const inputRef = useRef<InputHandler | null>(null)
    const particleSysRef = useRef<ParticleSystem | null>(null)
    const obstacleMgrRef = useRef<ObstacleManager | null>(null)
    const entitiesRef = useRef<Entity[]>([])
    const requestRef = useRef<number>(undefined)
    const activeRuleIdRef = useRef<string | null>(null)
    const frameCountRef = useRef(0)
    const traumaRef = useRef(0)
    const invincibleTimeRef = useRef(99999)
    const sessionFailuresRef = useRef(0)
    const countdownTimerRef = useRef(1.0)
    const countdownValRef = useRef<number | string | null>(3)
    const startPosRef = useRef(new Vector2(0, 0))
    const countdownRenderRef = useRef<number | string | null>(3)

    // Store
    const currentLevel = useGameStore(state => state.currentLevel)
    const storeState = useGameStore(state => state.state) // [NEW] Listen to store state
    const resetGameStore = useGameStore(state => state.actions.resetGame)
    const failLevel = useGameStore(state => state.actions.failLevel)
    const completeLevelWithRating = useGameStore(state => state.actions.completeLevelWithRating)

    const levelRef = useRef(currentLevel)
    useEffect(() => {
        registerRules()
        levelRef.current = currentLevel
    }, [currentLevel])

    // [NEW] Sync Store 'Won' State
    useEffect(() => {
        if (storeState === 'won') {
            setGamePhase('finished')
        }
    }, [storeState])

    // Game Flow State
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'transition' | 'finished' | 'failed' | 'paused' | 'level_complete'>('intro')
    const gameStateRef = useRef<'intro' | 'playing' | 'transition' | 'finished' | 'failed' | 'paused' | 'level_complete'>('intro')

    // UI State
    const [countdown, setCountdown] = useState<number | string | null>(3)
    const [flashOpacity] = useState(new Animated.Value(0))
    const hudOpacity = useRef(new Animated.Value(1)).current
    const lastHitTimeRef = useRef(0)
    const [showSettings, setShowSettings] = useState(false)
    const [starsEarned, setStarsEarned] = useState(0)
    const [starsCollected, setStarsCollected] = useState(0) // [NEW]

    const levelDef = LevelSequenceV2[currentLevel - 1]
    const currentRuleId = levelDef ? levelDef.ruleId : 'normal_movement'
    const currentRuleInfo = ruleManager.getContent(currentRuleId)

    const setGamePhase = (phase: 'intro' | 'playing' | 'transition' | 'finished' | 'failed' | 'paused' | 'level_complete') => {
        setGameState(phase)
        gameStateRef.current = phase

        // [FIX] Duck Music during Intro, Win, and Fail
        if (phase === 'intro' || phase === 'finished' || phase === 'failed' || phase === 'level_complete') {
            MusicManager.duckMusic(true);
        } else if (phase === 'playing') {
            MusicManager.duckMusic(false);
        }
    }

    const handleFullReset = () => {
        Alert.alert(
            "Erase All Progress?",
            "This will reset you to Level 1 and remove all stars. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Erase Everything",
                    style: "destructive",
                    onPress: () => {
                        resetGameStore()
                        setShowSettings(false)
                        if (currentLevel === 1) setTimeout(retryLevel, 100)
                    }
                }
            ]
        )
    }

    useEffect(() => {
        if (!levelDef && currentLevel > LevelSequenceV2.length) {
            setGamePhase('finished')
            MusicManager.duckMusic(true); // Ensure ducking on finish
            return
        }

        // [FIX] Defer Audio initialization to prevent Hermes crash on startup
        setTimeout(() => {
            AudioManager.getInstance().init()
            // No music at game start - countdown will manage it
        }, 1000)

        if (rendererRef.current) {
            const { width, height } = rendererRef.current
            entitiesRef.current = spawnEntities(width, height, currentLevel, levelDef?.obstacle)
            setStarsCollected(0)

            // [NEW] Setup Start Logic
            const p = entitiesRef.current.find(e => e.type === 'dot')
            if (p) startPosRef.current = new Vector2(p.pos.x, p.pos.y)
            invincibleTimeRef.current = 99999 // Infinite until move
        }

        startCountdownSequence()

        return () => {
            if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current as any)
        }
    }, [currentLevel, levelDef])

    // ... (unchanged)

    const startCountdownSequence = () => {
        countdownTimerRef.current = 1.0
        // Start at 5 to show LEVEL X title card for ~2 seconds before 3-2-1-GO
        countdownValRef.current = 5
        MusicManager.playTrack('none') // Stop ambient music during countdown
        countdownRenderRef.current = 5
        setCountdown(5)
        invincibleTimeRef.current = 2.0

        const { width, height } = Dimensions.get('window')
        startPosRef.current = new Vector2(width / 2, height - 150)
    }

    // [FIX] Robust Countdown Timer (setInterval)
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (gameState === 'intro') {
            interval = setInterval(() => {
                let val = countdownValRef.current
                if (typeof val === 'number') {
                    val--
                    if (val > 0) {
                        // Only play countdown sound for 3, 2, 1 (not during title card at 5, 4)
                        if (val <= 3) {
                            MusicManager.playSFX('countdown')
                        }
                        countdownValRef.current = val
                        setCountdown(val)
                    } else if (val === 0) {
                        MusicManager.playSFX('countdown_final')
                        countdownValRef.current = "GO!"
                        setCountdown("GO!")
                    } else {
                        // Cleanup negative/invalid states
                        countdownValRef.current = "GO!"
                    }
                } else if (val === 'GO!') {
                    setCountdown(null)
                    countdownValRef.current = -999
                    clearInterval(interval)
                    // [FIX] Defer game start to next tick to prevent Hermes crash
                    setTimeout(() => {
                        try {
                            setGamePhase('playing')
                            MusicManager.playTrack('game')
                        } catch (e) {
                            console.warn('Game start error:', e)
                        }
                    }, 100)
                    Animated.timing(hudOpacity, {
                        toValue: 0,
                        duration: 1000,
                        delay: 3000,
                        useNativeDriver: true
                    }).start()
                }
            }, 1000) // 1 second per countdown number
        }
        return () => clearInterval(interval)
    }, [gameState])

    const retryLevel = async () => {
        // Show ad first (skipped for levels 1-4)
        await AdManager.showAd(currentLevel)

        MusicManager.playTrack('none') // Stop music during retry countdown
        setShowSettings(false)
        setGamePhase('intro')
        hudOpacity.setValue(1)
        particleSysRef.current?.reset()

        if (rendererRef.current) {
            const { width, height } = rendererRef.current
            entitiesRef.current = spawnEntities(width, height, currentLevel, levelDef?.obstacle)
            setStarsCollected(0)
        }
        startCountdownSequence()
    }

    const handleFailure = () => {
        if (gameStateRef.current === 'finished' || gameStateRef.current === 'failed') return

        MusicManager.playTrack('none') // Silence on fail

        sessionFailuresRef.current += 1
        gameStateRef.current = 'failed' // Stop updates immediately

        failLevel()
        AudioManager.getInstance().play('fail') // [NEW] Soft Fail Sound
        AudioManager.getInstance().haptic('heavy')

        const player = entitiesRef.current.find(e => e.type === 'dot')
        if (player && particleSysRef.current) {
            particleSysRef.current.emit(player.pos.x, player.pos.y, { count: 50, speed: 300, life: 1.0, color: [1, 0, 0, 1] })
        }
        traumaRef.current = Math.min(1, traumaRef.current + 0.6)

        // Delayed Overlay for Death Animation
        // Updated: Global 300ms delay for snappy retries (User feedback L17)
        const delay = 300
        setTimeout(() => {
            setGamePhase('failed')
        }, delay)
    }

    const handleTransition = () => {
        // [FIX] Race Condition Guard: Ensure we only win if we are currently playing.
        // Prevents winning if we already hit an obstacle in the same frame (which sets ref to 'failed').
        if (gameStateRef.current !== 'playing') return

        gameStateRef.current = 'transition' // Lock state immediately references
        setGamePhase('transition')

        const exit = entitiesRef.current.find(e => e.type === 'exit')
        if (exit && particleSysRef.current) {
            particleSysRef.current.emit(exit.pos.x, exit.pos.y, {
                count: 300, speed: 800, life: 2.0, color: [1, 1, 1, 1], spread: Math.PI * 2
            })
        }
        traumaRef.current = 1.0

        MusicManager.playSFX('win')
        MusicManager.playTrack('none') // Silence on win

        // [REVERTED] Star Logic - Back to Survival Based
        let stars = 1
        if (sessionFailuresRef.current === 0) stars = 3
        else if (sessionFailuresRef.current <= 2) stars = 2

        setStarsEarned(stars)
        completeLevelWithRating(stars) // Fixed: Expected 1 arg

        Animated.sequence([
            Animated.timing(flashOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(flashOpacity, { toValue: 0, duration: 500, useNativeDriver: true })
        ]).start(({ finished }) => {
            if (finished) {
                setTimeout(() => {
                    setGamePhase('level_complete')
                }, 500)
            }
        })
    }

    const handleNextLevel = async () => {
        // Show ad first (skipped for levels 1-4)
        await AdManager.showAd(currentLevel)

        // Advance to next level in store
        useGameStore.getState().actions.nextLevel()

        // Reset UI state
        MusicManager.playTrack('none') // Stop music during next level countdown
        setShowSettings(false)
        setGamePhase('intro')
        hudOpacity.setValue(1)
        particleSysRef.current?.reset()
        setStarsCollected(0)

        // Wait for store update then respawn entities
        setTimeout(() => {
            const newLevel = useGameStore.getState().currentLevel
            const newLevelDef = LevelSequenceV2[newLevel - 1]
            if (rendererRef.current) {
                const { width, height } = rendererRef.current
                entitiesRef.current = spawnEntities(width, height, newLevel, newLevelDef?.obstacle)
            }
            startCountdownSequence()
        }, 50)
    }

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                if (gameStateRef.current === 'playing') {
                    // [REMOVED] Legacy 'Flappy Jump' logic (User requested removal of bounce on tap)
                    // const player = entitiesRef.current.find(e => e.type === 'dot')
                    // if (player) {
                    //     player.vel.y = -350
                    // }
                    inputRef.current?.onStart(evt.nativeEvent.pageX, evt.nativeEvent.pageY)
                    MusicManager.playSFX('tap')  // [NEW] Play tap sound
                }
            },
            onPanResponderMove: (evt) => {
                if (gameStateRef.current === 'playing')
                    inputRef.current?.onMove(evt.nativeEvent.pageX, evt.nativeEvent.pageY)
            },
            onPanResponderRelease: () => {
                inputRef.current?.onEnd()
            },
            onPanResponderTerminate: () => {
                inputRef.current?.onEnd()
            }
        })
    ).current

    const onContextCreate = async (gl: any) => {
        console.log("GL: Context Create Start") // [DEBUG]
        // [FIX] Guard against conditional null GL or Unmount
        if (!gl || !runningRef.current) return
        glRef.current = gl

        const { width, height } = Dimensions.get('window')
        rendererRef.current = new Renderer(gl, width, height)
        physicsRef.current = new PhysicsSystem(width, height)
        inputRef.current = new InputHandler()
        particleSysRef.current = new ParticleSystem(1000)
        obstacleMgrRef.current = new ObstacleManager()

        // [FIX] Ensure entities are only spawned if renderer is ready
        if (rendererRef.current) {
            entitiesRef.current = spawnEntities(width, height, currentLevel, levelDef?.obstacle)
        }
        console.log("GL: Context Create End") // [DEBUG]

        let lastTime = 0
        const gameTimeRef = { current: 0 }
        let firstFrame = true

        const loop = (time: number) => {
            if (!runningRef.current || !glRef.current) return // [FIX] Stop if unmounted/no-GL

            requestRef.current = requestAnimationFrame(loop)
            const dt = Math.min((time - lastTime) / 1000, 0.1)
            lastTime = time
            frameCountRef.current++

            if (firstFrame) { console.log("GL: First Frame Start"); firstFrame = false; } // [DEBUG]

            try {
                const renderer = rendererRef.current
                const physics = physicsRef.current
                const input = inputRef.current
                const particles = particleSysRef.current

                if (!renderer || !physics || !input || !particles) return

                if (gameStateRef.current === 'playing' || gameStateRef.current === 'transition') {
                    gameTimeRef.current += dt
                }
                // [NEW] Hide Lightning during intro (timer)
                const showGround = gameStateRef.current !== 'intro'
                renderer.drawBackground(gameTimeRef.current, currentLevel, showGround)
                particles.update(dt)
                renderer.drawParticles(particles)

                // [REMOVED] Joystick Overlay (User requested removal)
                // const joystickMode = useGameStore.getState().settings.joystickMode
                // if (gameStateRef.current === 'playing' || gameStateRef.current === 'transition') {
                //     renderer.drawJoystick(input, joystickMode)
                // }

                if (gameStateRef.current === 'finished') {
                    if (Math.random() < 0.05) {
                        const x = Math.random() * width
                        const y = Math.random() * height * 0.5
                        particles.emit(x, y, { count: 100, speed: 400, life: 1.5, color: [Math.random(), Math.random(), 1, 1] })
                    }
                }

                if (gameStateRef.current === 'intro') {
                    // Logic moved to useEffect for stability
                }

                // Logic Update
                const currentLvl = levelRef.current
                const lvlDef = LevelSequenceV2[currentLvl - 1]
                const ruleId = lvlDef ? lvlDef.ruleId : 'normal_movement'

                const activeRule = ruleManager.getContent(ruleId)
                if (activeRule) {
                    const context = {
                        entities: entitiesRef.current,
                        bounds: { width: renderer.width, height: renderer.height },
                        inputState: { isDown: input.isDown, x: input.x, y: input.y }
                    }

                    if (activeRule.id !== activeRuleIdRef.current) {
                        if (activeRuleIdRef.current) {
                            ruleManager.getContent(activeRuleIdRef.current)?.onExit?.(context)
                        }
                        activeRule.onEnter?.(context)
                        activeRuleIdRef.current = activeRule.id
                    }

                    let modifiedDt = activeRule.modifyDeltaTime(dt, context)
                    if (activeRule.id === 'time-stops-touch' && input.isDown) {
                        modifiedDt = 0
                    }

                    if (entitiesRef.current.length === 0) {
                        entitiesRef.current = spawnEntities(renderer.width, renderer.height, currentLevel, levelDef?.obstacle)
                    }


                    const player = entitiesRef.current.find(e => e.type === 'dot')

                    if (player && obstacleMgrRef.current) {
                        if (gameStateRef.current === 'playing' || gameStateRef.current === 'transition') {
                            obstacleMgrRef.current.update(entitiesRef.current, modifiedDt, player.pos)
                        }
                    }

                    if (player) {
                        if (gameStateRef.current === 'playing') {
                            const delta = input.getDelta()
                            const INPUT_FORCE = 55

                            const inputVec = delta.mul(INPUT_FORCE)
                            const modifiedInput = activeRule.modifyInput(inputVec, modifiedDt, { isDown: input.isDown })

                            player.vel = player.vel.add(modifiedInput)

                            // Physics (Friction, Integration, Wall Checks) now handled by PhysicsSystem called below
                        } else {
                            // Paused/Transition damping handled by PhysicsSystem
                        }
                    }

                    const exit = entitiesRef.current.find(e => e.type === 'exit')
                    if (exit && player && (gameStateRef.current === 'playing' || gameStateRef.current === 'transition')) {
                        const toPlayer = player.pos.sub(exit.pos)
                        let force = toPlayer.normalize().mul(-1.0)
                        const EXIT_SPEED = 370 // [UPDATE] 30% Boost (285 -> 370)
                        const wallDist = 100
                        const w = renderer.width
                        const h = renderer.height

                        if (exit.pos.x < wallDist) force.x += (1.0 - exit.pos.x / wallDist) * 2.0
                        if (exit.pos.x > w - wallDist) force.x -= (1.0 - (w - exit.pos.x) / wallDist) * 2.0
                        if (exit.pos.y < wallDist) force.y += (1.0 - exit.pos.y / wallDist) * 2.0
                        if (exit.pos.y > h - wallDist) force.y -= (1.0 - (h - exit.pos.y) / wallDist) * 2.0

                        const runDir = force.normalize()
                        const targetVel = runDir.mul(EXIT_SPEED)
                        const alpha = Math.min(1.0, dt * 3.0)
                        const newVel = exit.vel.add(targetVel.sub(exit.vel).mul(alpha))
                        exit.vel = newVel

                        exit.alpha = 1.0
                        exit.radius = 15 + 2 * Math.sin(time / 200)

                        const cycle = Math.floor(time / 4000) % 3
                        if (cycle === 0) exit.color = '#ff00ff'
                        if (cycle === 1) exit.color = '#ffff00'
                        if (cycle === 2) exit.color = '#00ff00'
                    } else if (exit) {
                        exit.vel = new Vector2(0, 0)
                    }

                    let physicsEvents: any[] = []
                    if (gameStateRef.current === 'playing' || gameStateRef.current === 'transition') {
                        physicsEvents = physics.update(entitiesRef.current, activeRule, modifiedDt, context)
                        if (player && player.pos.y > renderer.height + player.radius) {
                            handleFailure()
                        }
                        physicsEvents.forEach(ev => {
                            if (ev.type === 'wall_hit' && ev.force > 80) {
                                // Debounce sound (100ms) to prevent double-triggers "harshness"
                                const now = Date.now()
                                if (now - lastHitTimeRef.current > 100) {
                                    // AudioManager.getInstance().play('tick', 0.9 + Math.random() * 0.2) // Removed per user request
                                    lastHitTimeRef.current = now
                                }
                                particles.emit(ev.position.x, ev.position.y, {
                                    count: 5, speed: ev.force * 0.5, life: 0.3, color: [1, 1, 1, 0.8], spread: Math.PI
                                })
                            }
                            if (ev.type === 'wall_hit' && ev.force > 300) traumaRef.current = Math.min(1, traumaRef.current + 0.1)
                        })
                    }

                    let camera = { scale: 1, rotation: 0, offset: { x: 0, y: 0 } as any }
                    let trauma = traumaRef.current
                    if (trauma > 0) {
                        trauma = Math.max(0, trauma - dt * 0.8)
                        traumaRef.current = trauma
                        const shake = trauma * trauma
                        const angle = Math.random() * Math.PI * 2
                        const offset = shake * 20
                        camera.offset.x += Math.cos(angle) * offset
                        camera.offset.y += Math.sin(angle) * offset
                    }
                    camera = activeRule.modifyCamera(camera, modifiedDt)

                    if (gameStateRef.current !== 'intro') {
                        renderer.currentLevel = levelRef.current
                        renderer.setCamera(camera)
                        renderer.applyCamera()
                        entitiesRef.current.forEach(e => renderer.drawEntity(e))
                    }

                    if (gameStateRef.current === 'playing') {
                        // [NEW] Safe Ring Logic (Infinite until leave)
                        if (invincibleTimeRef.current > 0) {
                            if (player) {
                                // Visual Pulse
                                player.alpha = 0.5 + 0.5 * Math.abs(Math.sin(time * 0.005))

                                // Check Distance from Start Ring (Radius 50)
                                const ring = entitiesRef.current.find(e => e.id === 'safe_ring')

                                if (!ring) {
                                    // [FIX] Ring Missing Fallback: Use Timer (2s)
                                    // If ring fails to spawn, we don't want instant death or perma-invincibility.
                                    // Treat 'invincibleTimeRef' as a countdown in this case.
                                    // If it was infinite (99999), cap it to 2s first.
                                    if (invincibleTimeRef.current > 10) invincibleTimeRef.current = 2.0

                                    invincibleTimeRef.current -= Number(modifiedDt)
                                    if (invincibleTimeRef.current <= 0) {
                                        player.alpha = 1.0
                                    }
                                } else if (player.pos.dist(ring.pos) > 60) {
                                    // Player left the ring
                                    invincibleTimeRef.current = 0
                                    player.alpha = 1.0

                                    // Remove Ring Entity immediately
                                    entitiesRef.current = entitiesRef.current.filter(e => e.id !== 'safe_ring')
                                }
                            }
                        } else {
                            // [FIX] Grace Period: Don't disable invincibility in first 0.5s (approx 30 frames)
                            // This protects against instant-spawn kills or weird init states
                            if (frameCountRef.current > 30) {
                                if (player) player.alpha = 1.0
                            }
                        }

                        const obstacles = entitiesRef.current.filter(e => e.type === 'obstacle')
                        if (player) {
                            obstacles.forEach(obs => {
                                if (obs.behavior === 'phasing' && obs.phaseHidden) return
                                const dist = player.pos.dist(obs.pos)
                                const collisionDist = player.radius + obs.radius

                                if (dist < collisionDist) {
                                    if (invincibleTimeRef.current <= 0) {
                                        // [NEW] Impact effects at collision point
                                        const impactX = (player.pos.x + obs.pos.x) / 2
                                        const impactY = (player.pos.y + obs.pos.y) / 2

                                        // Explosion particles at impact
                                        particleSysRef.current?.emit(impactX, impactY, {
                                            count: 30,
                                            speed: 250,
                                            life: 0.6,
                                            color: [1, 0.3, 0.1, 1],  // Orange-red
                                            spread: Math.PI * 2
                                        })

                                        // Sparks
                                        particleSysRef.current?.emit(impactX, impactY, {
                                            count: 15,
                                            speed: 400,
                                            life: 0.3,
                                            color: [1, 1, 0.5, 1],  // Yellow sparks
                                            spread: Math.PI * 2
                                        })

                                        // Screen shake on impact
                                        traumaRef.current = Math.min(1, traumaRef.current + 0.4)

                                        handleFailure()
                                    }
                                }
                            })
                        }

                        const exit = entitiesRef.current.find(e => e.type === 'exit')
                        if (exit && frameCountRef.current % 10 === 0) {
                            particles.emit(exit.pos.x, exit.pos.y, { count: 2, life: 1.0, speed: 50, color: [1, 0, 1, 0.6], spread: Math.PI * 2 })
                        }
                        if (player && exit) {
                            if (player.pos.dist(exit.pos) < player.radius + exit.radius) {
                                // [NEW] Celebratory burst when reaching goal
                                AudioManager.getInstance().haptic('medium') // [NEW] Vibration on Win

                                particles.emit(exit.pos.x, exit.pos.y, {
                                    count: 50,
                                    speed: 300,
                                    life: 1.0,
                                    color: [1, 0, 1, 1],  // Magenta
                                    spread: Math.PI * 2
                                })
                                particles.emit(exit.pos.x, exit.pos.y, {
                                    count: 30,
                                    speed: 200,
                                    life: 0.8,
                                    color: [0, 1, 1, 1],  // Cyan
                                    spread: Math.PI * 2
                                })
                                particles.emit(exit.pos.x, exit.pos.y, {
                                    count: 20,
                                    speed: 150,
                                    life: 0.6,
                                    color: [1, 1, 0, 1],  // Yellow
                                    spread: Math.PI * 2
                                })

                                handleTransition()
                            }
                        }
                    } // End Active Rule
                } // End Active Rule Check

                // [FIX] Safe End Frame
                glRef.current?.endFrameEXP()
            } catch (e) {
                // Swallow native crash risk (don't retry gl)
            }
        }
        requestRef.current = requestAnimationFrame(loop)
    }

    // [FIX] Layout Safety: Ensure we have dimensions before mounting GLView
    // This prevents native crashes if GLView tries to create a surface with 0x0 size
    const [layoutReady, setLayoutReady] = useState(false)
    const onLayout = (e: any) => {
        const { width, height } = e.nativeEvent.layout
        console.log(`Layout Ready: ${width}x${height}`) // [DEBUG]
        if (width > 0 && height > 0) {
            // [FIX] Small delay to ensure native surface is ready (reduced from 2000ms - SDK 52 is stable)
            setTimeout(() => {
                setLayoutReady(true)
            }, 500)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }} {...panResponder.panHandlers} onLayout={onLayout}>
            {layoutReady && <GLView style={{ flex: 1 }} msaaSamples={0} onContextCreate={onContextCreate} />}

            <LevelStartSequence
                count={countdown}
                visible={gameState === 'intro'}
                level={currentLevel}
                ruleName={currentRuleInfo?.name || 'Unknown Zone'}
            />

            {gameState === 'failed' && <LevelFailedOverlay onRetry={retryLevel} onMenu={onBack || (() => { })} />}

            {gameState === 'level_complete' && (
                <LevelCompleteOverlay
                    level={currentLevel}
                    stars={starsEarned}
                    onNext={handleNextLevel}
                    onReplay={retryLevel}
                    onMenu={onBack || (() => { })}
                />
            )}

            {gameState === 'finished' && <GameCompleteScreen onBack={onBack || (() => { })} />}

            {showSettings && (
                <GamePauseOverlay
                    onResume={() => { setShowSettings(false); setGamePhase('playing'); }}
                    onReset={retryLevel}
                    onQuit={onQuitToMenu || onBack || (() => { })}
                    onFullReset={handleFullReset}
                />
            )}

            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'white', opacity: flashOpacity, pointerEvents: 'none' }]} />

            <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 60 }}>
                <TouchableOpacity onPress={onBack} style={styles.hudBtn}>
                    <Text style={[styles.hudBtnText, { fontSize: 28, marginTop: -4 }]}>‹</Text>
                </TouchableOpacity>
            </View>

            <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 60 }}>
                <TouchableOpacity onPress={() => { setShowSettings(true); setGamePhase('paused'); }} style={styles.hudBtn}>
                    <Text style={styles.hudBtnText}>II</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, width: '100%', alignItems: 'center', opacity: hudOpacity, pointerEvents: 'none' }}>
                {(!currentRuleInfo?.name.toLowerCase().includes('normal') && currentRuleInfo?.id !== 'normal_movement') && (
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' }}>
                        {currentRuleInfo?.name || 'ZONE'}
                    </Text>
                )}
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    hudBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
    },
    hudBtnText: {
        color: 'white', fontWeight: 'bold', fontSize: 14
    }
})
