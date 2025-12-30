import { useEffect, useRef } from 'react'

export const useGameLoop = (callback: (dt: number) => void, paused: boolean = false) => {
    const requestRef = useRef<number>()
    const previousTimeRef = useRef<number>()

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000 // Convert to seconds
            // Cap dt to prevent huge jumps if tab is inactive
            const cappedDt = Math.min(deltaTime, 0.1)
            callback(cappedDt)
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        if (!paused) {
            requestRef.current = requestAnimationFrame(animate)
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
        }
    }, [paused, callback])
}
