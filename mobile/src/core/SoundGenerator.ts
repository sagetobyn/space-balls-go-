import { encode } from 'base64-arraybuffer'

// Configuration
const SAMPLE_RATE = 44100
const NUM_CHANNELS = 1
const BITS_PER_SAMPLE = 16

export class SoundGenerator {

    // ============================================================
    // LOW-PASS FILTER - Creates softer, warmer tones
    // ============================================================
    private static lowPassFilter(buffer: Float32Array, cutoff: number = 0.15): Float32Array {
        const result = new Float32Array(buffer.length)
        let lastOut = 0
        for (let i = 0; i < buffer.length; i++) {
            lastOut = lastOut + cutoff * (buffer[i] - lastOut)
            result[i] = lastOut
        }
        return result
    }

    // ============================================================
    // REVERB EFFECT - Adds spaciousness and warmth
    // ============================================================
    private static addReverb(buffer: Float32Array, decay: number = 0.3, wetMix: number = 0.4): Float32Array {
        const result = new Float32Array(buffer.length)
        const delayMs = [23, 37, 53, 71, 97] // Multiple delay lines for richer reverb
        const delayBuffers = delayMs.map(ms => Math.floor(SAMPLE_RATE * ms / 1000))

        for (let i = 0; i < buffer.length; i++) {
            let wet = 0
            for (const delay of delayBuffers) {
                if (i >= delay) {
                    wet += result[i - delay] * decay / delayBuffers.length
                }
            }
            result[i] = buffer[i] * (1 - wetMix) + (buffer[i] + wet) * wetMix
        }
        return result
    }

    // ============================================================
    // ADVANCED ENVELOPE - Smooth fade in/out for natural sound
    // ============================================================
    static generateEnvelope(length: number, attack: number, decay: number, sustain: number, release: number): Float32Array {
        const env = new Float32Array(length)
        const attackSamples = Math.floor(length * attack)
        const decaySamples = Math.floor(length * decay)
        const releaseSamples = Math.floor(length * release)
        const sustainSamples = length - attackSamples - decaySamples - releaseSamples

        for (let i = 0; i < length; i++) {
            if (i < attackSamples) {
                // Smooth exponential attack
                env[i] = Math.pow(i / attackSamples, 0.5)
            } else if (i < attackSamples + decaySamples) {
                const progress = (i - attackSamples) / decaySamples
                env[i] = 1.0 - ((1.0 - sustain) * Math.pow(progress, 0.5))
            } else if (i < length - releaseSamples) {
                env[i] = sustain
            } else {
                const progress = (i - (length - releaseSamples)) / releaseSamples
                env[i] = sustain * (1.0 - Math.pow(progress, 0.5))
            }
        }
        return env
    }

    // ============================================================
    // MIXING UTILITY
    // ============================================================
    static mix(buffers: Float32Array[], volume: number = 1.0): Float32Array {
        if (buffers.length === 0) return new Float32Array(0)
        const length = Math.max(...buffers.map(b => b.length))
        const result = new Float32Array(length)

        for (let i = 0; i < length; i++) {
            let sum = 0
            for (const buffer of buffers) {
                if (i < buffer.length) sum += buffer[i]
            }
            result[i] = Math.max(-1, Math.min(1, sum * volume))
        }
        return result
    }

    // ============================================================
    // STAR COLLECT - Gentle chime with harmonics
    // ============================================================
    static generateStarSound(): Float32Array {
        const duration = 0.5
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const progress = t / duration

            // Musical pitch: C major arpeggio feel
            const baseFreq = 523.25 // C5

            // Gentle pitch rise at start
            const pitchMod = 1 + (progress < 0.1 ? (1 - progress / 0.1) * 0.1 : 0)
            const freq = baseFreq * pitchMod

            // Soft sine with warm harmonics
            const w1 = Math.sin(2 * Math.PI * freq * t) * 0.5
            const w2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.2 // Octave
            const w3 = Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.15 // Fifth
            const w4 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.08 // Higher harmonic

            // Very gentle attack and long decay
            const attack = 1 - Math.exp(-t * 20) // Smooth attack
            const decay = Math.exp(-t * 4) // Gentle decay

            buffer[i] = (w1 + w2 + w3 + w4) * attack * decay * 0.25
        }

        return this.addReverb(this.lowPassFilter(buffer, 0.3), 0.2, 0.3)
    }

    // ============================================================
    // FAIL/DEATH SOUND - Soft, muted disappointment
    // ============================================================
    static generateFailSound(): Float32Array {
        const duration = 0.6
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Descending minor third (sad interval)
            const freq1 = 220 * Math.exp(-t * 1.5) // A3 descending
            const freq2 = 185 * Math.exp(-t * 1.5) // F#3 descending

            const w1 = Math.sin(2 * Math.PI * freq1 * t) * 0.4
            const w2 = Math.sin(2 * Math.PI * freq2 * t) * 0.3
            const w3 = Math.sin(2 * Math.PI * freq1 * 0.5 * t) * 0.2 // Sub-bass

            // Very gentle envelope
            const attack = 1 - Math.exp(-t * 30)
            const decay = Math.exp(-t * 3)

            buffer[i] = (w1 + w2 + w3) * attack * decay * 0.3
        }

        return this.lowPassFilter(buffer, 0.2)
    }

    // ============================================================
    // WIN/LEVEL COMPLETE - Ethereal, warm swell
    // ============================================================
    static generateWinSound(): Float32Array {
        const duration = 3.0
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)
        const env = this.generateEnvelope(len, 0.35, 0.2, 0.4, 0.45)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Warm major 7th chord (dreamy, ambient)
            const notes = [
                { freq: 261.63, vol: 1.0 },   // C4
                { freq: 329.63, vol: 0.7 },   // E4
                { freq: 392.00, vol: 0.6 },   // G4
                { freq: 493.88, vol: 0.4 },   // B4
                { freq: 523.25, vol: 0.25 },  // C5
            ]

            let sample = 0
            for (const note of notes) {
                // Gentle detuning for chorus effect
                const detune = 1 + Math.sin(t * 3 + note.freq * 0.01) * 0.003
                sample += Math.sin(2 * Math.PI * note.freq * detune * t) * note.vol
            }

            buffer[i] = sample * 0.15 * env[i]
        }

        return this.addReverb(this.lowPassFilter(buffer, 0.25), 0.35, 0.5)
    }

    // ============================================================
    // COUNTDOWN TICK - Soft, warm beep
    // ============================================================
    static generateCountdownTick(isFinal: boolean): Float32Array {
        const freq = isFinal ? 880 : 587.33 // A5 for final, D5 for normal
        const duration = isFinal ? 0.35 : 0.2
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Soft sine with subtle harmonic
            const w1 = Math.sin(2 * Math.PI * freq * t)
            const w2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.15 // Light harmonic

            // Gentle attack and decay
            const attack = 1 - Math.exp(-t * 40)
            const decay = Math.exp(-t * (isFinal ? 4 : 8))

            buffer[i] = (w1 + w2) * attack * decay * 0.3
        }

        return this.lowPassFilter(buffer, 0.4)
    }

    // ============================================================
    // TAP/UI CLICK - Soft, satisfying click
    // ============================================================
    static generateTapSound(): Float32Array {
        const len = Math.floor(SAMPLE_RATE * 0.1)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Muted click with warmth
            const tone1 = Math.sin(2 * Math.PI * 800 * t) * 0.4
            const tone2 = Math.sin(2 * Math.PI * 1200 * t) * 0.2

            // Very quick but smooth envelope
            const attack = 1 - Math.exp(-t * 300)
            const decay = Math.exp(-t * 50)

            buffer[i] = (tone1 + tone2) * attack * decay * 0.25
        }

        return this.lowPassFilter(buffer, 0.5)
    }

    // ============================================================
    // SOFT COLLISION - Gentle bump
    // ============================================================
    static generateSoftCollision(): Float32Array {
        const duration = 0.12
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const freq = 120 - (t * 400) // Gentle pitch drop
            const env = Math.exp(-t * 30)
            const tone = Math.sin(2 * Math.PI * Math.max(30, freq) * t)

            buffer[i] = tone * env * 0.25
        }

        return this.lowPassFilter(buffer, 0.3)
    }

    // ============================================================
    // MENU MUSIC - Ambient, dreamy space atmosphere
    // ============================================================
    static generateMenuMusic(): Float32Array {
        const duration = 6.0 // 6 second loop
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const progress = t / duration

            // 1. Deep Space Pad - Warm, evolving chord
            const padNotes = [
                { freq: 65.41, vol: 0.3 },   // C2 (deep bass)
                { freq: 130.81, vol: 0.25 }, // C3
                { freq: 196.00, vol: 0.2 },  // G3
                { freq: 246.94, vol: 0.15 }, // B3
            ]

            let pad = 0
            for (const note of padNotes) {
                // Slow LFO modulation for movement
                const lfo = 1 + Math.sin(t * 0.3 + note.freq * 0.02) * 0.02
                pad += Math.sin(2 * Math.PI * note.freq * lfo * t) * note.vol
            }

            // Very slow breathing envelope
            const padEnv = 0.7 + Math.sin(t * 0.5) * 0.3
            pad *= padEnv * 0.08

            // 2. Crystal Arpeggios - Gentle, spaced out plucks
            const beatLen = 1.5 // Slow tempo
            const beatTime = t % beatLen
            const noteIndex = Math.floor(t / (beatLen / 2)) % 4

            const arpNotes = [523.25, 659.26, 783.99, 659.26] // C5, E5, G5, E5
            const arpFreq = arpNotes[noteIndex]

            // Soft pluck with long tail
            const pluckEnv = Math.exp(-beatTime * 3)
            const pluck = Math.sin(2 * Math.PI * arpFreq * t) * pluckEnv * 0.08

            // Add subtle harmonic for shimmer
            const shimmer = Math.sin(2 * Math.PI * arpFreq * 2 * t) * pluckEnv * 0.03

            buffer[i] = (pad + pluck + shimmer) * 0.6
        }

        // Apply gentle low-pass for warmth
        return this.lowPassFilter(buffer, 0.15)
    }

    // ============================================================
    // GAME MUSIC - Flowing, atmospheric journey
    // ============================================================
    static generateGameMusic(): Float32Array {
        // ~8 seconds loop at 100 BPM
        const bpm = 100
        const beatLen = 60 / bpm
        const duration = 16 * beatLen // 16 beats = 4 bars
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // 1. Soft Ambient Pad - Warm foundation
            const padNotes = [
                { freq: 130.81, vol: 0.4 },  // C3
                { freq: 196.00, vol: 0.3 },  // G3
                { freq: 261.63, vol: 0.2 },  // C4
            ]

            let pad = 0
            for (const note of padNotes) {
                const lfo = 1 + Math.sin(t * 0.4 + note.freq * 0.01) * 0.015
                pad += Math.sin(2 * Math.PI * note.freq * lfo * t) * note.vol
            }
            pad *= 0.06

            // 2. Gentle Pulse - Soft rhythmic foundation (not harsh kick)
            const beatTime = t % beatLen
            const pulseFreq = 80
            const pulseEnv = Math.exp(-beatTime * 8)
            const pulse = Math.sin(2 * Math.PI * pulseFreq * beatTime) * pulseEnv * 0.12

            // 3. Flowing Arpeggio - Dreamy melody
            const eighth = beatLen / 2
            const step = Math.floor(t / eighth) % 8
            const bar = Math.floor(t / (beatLen * 4)) % 2

            // Two-bar pattern with variation
            const patterns = [
                [261.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63], // C major pattern
                [246.94, 311.13, 369.99, 466.16, 493.88, 466.16, 369.99, 311.13], // B major pattern (slight shift)
            ]

            const arpFreq = patterns[bar][step]
            const noteTime = t % eighth
            const arpEnv = Math.exp(-noteTime * 4)

            // Soft sine with subtle harmonic
            const arp = Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.08
            const arpHarmonic = Math.sin(2 * Math.PI * arpFreq * 2 * t) * arpEnv * 0.025

            // 4. Atmospheric texture - Very subtle shimmer
            const shimmerFreq = 1046.50 + Math.sin(t * 2) * 50 // High C with wobble
            const shimmer = Math.sin(2 * Math.PI * shimmerFreq * t) * 0.015
            const shimmerEnv = 0.5 + Math.sin(t * 0.3) * 0.5

            buffer[i] = (pad + pulse + arp + arpHarmonic + shimmer * shimmerEnv) * 0.7
        }

        return this.lowPassFilter(buffer, 0.2)
    }

    // ============================================================
    // CHASE LOOP - Subtle wind/movement atmosphere
    // ============================================================
    static generateChaseLoop(): Float32Array {
        const duration = 2.0
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        let lastOut = 0
        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Filtered white noise (wind effect)
            const white = Math.random() * 2 - 1

            // Variable cutoff for breathing texture
            const cutoff = 0.08 + Math.sin(t * 1.2) * 0.02
            lastOut = lastOut + (white - lastOut) * cutoff

            // Very subtle high pitched movement indicator
            const whine = Math.sin(2 * Math.PI * 300 * t) * 0.03
            const whineEnv = 0.5 + Math.sin(t * 2) * 0.5

            buffer[i] = (lastOut * 1.5 + whine * whineEnv) * 0.25
        }

        return this.lowPassFilter(buffer, 0.3)
    }

    // ============================================================
    // LEGACY METHODS - For compatibility
    // ============================================================
    static generateTone(freq: number, duration: number, type: 'sine' | 'square' | 'saw' | 'triangle' = 'sine', volume: number = 0.5): Float32Array {
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)

        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            let sample = 0

            if (type === 'sine') {
                sample = Math.sin(2 * Math.PI * freq * t)
            } else if (type === 'square') {
                sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1
            } else if (type === 'saw') {
                sample = 2 * (t * freq - Math.floor(t * freq + 0.5))
            } else if (type === 'triangle') {
                sample = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1
            }

            // Smooth Envelope
            const attackTime = 0.1
            const decayTime = 0.15
            let envelope = 1.0

            if (t < attackTime) {
                envelope = Math.pow(t / attackTime, 0.5)
            } else if (t > duration - decayTime) {
                envelope = Math.pow((duration - t) / decayTime, 0.5)
            }

            buffer[i] = sample * volume * envelope
        }
        return this.lowPassFilter(buffer, 0.4)
    }

    static generateNoise(duration: number, volume: number = 0.5): Float32Array {
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            const envelope = 1.0 - (t / duration)
            buffer[i] = (Math.random() * 2 - 1) * volume * envelope
        }
        return this.lowPassFilter(buffer, 0.2)
    }

    static generateJump(): Float32Array {
        const duration = 0.25
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)

        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            const progress = t / duration
            const freq = 180 + (progress * 300) // Gentler pitch rise
            buffer[i] = Math.sin(2 * Math.PI * freq * t) * 0.35 * (1 - progress)
        }
        return this.lowPassFilter(buffer, 0.4)
    }

    static generateExplosion(): Float32Array {
        const duration = 0.4
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)

        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            const envelope = Math.pow(1 - (t / duration), 2)
            const noise = (Math.random() * 2 - 1) * 0.4
            const tone = Math.sin(2 * Math.PI * 60 * t) * 0.4 // Lower rumble
            buffer[i] = (noise + tone) * envelope
        }
        return this.lowPassFilter(buffer, 0.15)
    }

    // ============================================================
    // WAV CONVERSION
    // ============================================================
    static createWavUrl(samples: Float32Array): string {
        const buffer = new ArrayBuffer(44 + samples.length * 2)
        const view = new DataView(buffer)

        // RIFF chunk descriptor
        this.writeString(view, 0, 'RIFF')
        view.setUint32(4, 36 + samples.length * 2, true)
        this.writeString(view, 8, 'WAVE')

        // fmt sub-chunk
        this.writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, NUM_CHANNELS, true)
        view.setUint32(24, SAMPLE_RATE, true)
        view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * 2, true)
        view.setUint16(32, NUM_CHANNELS * 2, true)
        view.setUint16(34, BITS_PER_SAMPLE, true)

        // data sub-chunk
        this.writeString(view, 36, 'data')
        view.setUint32(40, samples.length * 2, true)

        // Write Samples
        let offset = 44
        for (let i = 0; i < samples.length; i++) {
            const s = Math.max(-1, Math.min(1, samples[i]))
            const val = s < 0 ? s * 0x8000 : s * 0x7FFF
            view.setInt16(offset, val, true)
            offset += 2
        }

        const binary = encode(buffer)
        return `data:audio/wav;base64,${binary}`
    }

    private static writeString(view: DataView, offset: number, string: string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }
}
