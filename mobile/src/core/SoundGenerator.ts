import { encode } from 'base64-arraybuffer'

// Configuration
const SAMPLE_RATE = 44100
const NUM_CHANNELS = 1
const BITS_PER_SAMPLE = 16

export class SoundGenerator {

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

            // Simple Envelope (Attack / Decay)
            const attackTime = 0.05
            const decayTime = 0.1
            let envelope = 1.0

            if (t < attackTime) {
                envelope = t / attackTime
            } else if (t > duration - decayTime) {
                envelope = (duration - t) / decayTime
            }

            buffer[i] = sample * volume * envelope
        }
        return buffer
    }

    static generateNoise(duration: number, volume: number = 0.5): Float32Array {
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            // Decay
            const envelope = 1.0 - (t / duration)
            buffer[i] = (Math.random() * 2 - 1) * volume * envelope
        }
        return buffer
    }

    // Creates a "Jump" sound: Slide pitch up
    static generateJump(): Float32Array {
        const duration = 0.2
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)

        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            const progress = t / duration
            const freq = 200 + (progress * 400) // 200Hz to 600Hz
            buffer[i] = Math.sin(2 * Math.PI * freq * t) * 0.5 * (1 - progress)
        }
        return buffer
    }

    // Creates "Explosion": Noise + Low freq sine
    static generateExplosion(): Float32Array {
        const duration = 0.5
        const numSamples = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(numSamples)

        for (let i = 0; i < numSamples; i++) {
            const t = i / SAMPLE_RATE
            const envelope = Math.pow(1 - (t / duration), 2)
            const noise = (Math.random() * 2 - 1)
            const tone = Math.sin(2 * Math.PI * 50 * t) // Rumble
            buffer[i] = (noise * 0.7 + tone * 0.3) * envelope
        }
        return buffer
    }

    // [NEW] Mixing multiple buffers
    static mix(buffers: Float32Array[], volume: number = 1.0): Float32Array {
        if (buffers.length === 0) return new Float32Array(0)
        const length = Math.max(...buffers.map(b => b.length))
        const result = new Float32Array(length)

        for (let i = 0; i < length; i++) {
            let sum = 0
            for (const buffer of buffers) {
                if (i < buffer.length) sum += buffer[i]
            }
            result[i] = Math.max(-1, Math.min(1, sum * volume)) // Hard Limiter
        }
        return result
    }

    // [NEW] ADSR Envelope
    static generateEnvelope(length: number, attack: number, decay: number, sustain: number, release: number): Float32Array {
        const env = new Float32Array(length)
        const attackSamples = Math.floor(length * attack)
        const decaySamples = Math.floor(length * decay)
        const releaseSamples = Math.floor(length * release)
        const sustainSamples = length - attackSamples - decaySamples - releaseSamples

        for (let i = 0; i < length; i++) {
            if (i < attackSamples) env[i] = i / attackSamples
            else if (i < attackSamples + decaySamples) env[i] = 1.0 - ((1.0 - sustain) * (i - attackSamples) / decaySamples)
            else if (i < length - releaseSamples) env[i] = sustain
            else env[i] = sustain * (1.0 - (i - (length - releaseSamples)) / releaseSamples)
        }
        return env
    }

    // [NEW] Creative SFX Generators for User Requests

    static generateStarSound(): Float32Array {
        // [IMPROVED] Bright, satisfying "coin collect" chime
        const duration = 0.3
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const progress = t / duration

            // Quick pitch rise then hold (coin collect feel)
            const pitch = 1200 + (progress < 0.1 ? progress * 10 * 400 : 400)

            // Bright sine with harmonics
            const w1 = Math.sin(2 * Math.PI * pitch * t)
            const w2 = Math.sin(2 * Math.PI * (pitch * 2) * t) * 0.3 // Octave harmonic
            const w3 = Math.sin(2 * Math.PI * (pitch * 1.5) * t) * 0.15 // Fifth

            // Sharp attack, medium decay
            const attack = Math.min(1, t * 50)
            const decay = Math.exp(-t * 8)

            buffer[i] = (w1 + w2 + w3) * attack * decay * 0.25
        }
        return buffer
    }

    // [IMPROVED] Fail Sound - Punchy "game over" tone
    static generateFailSound(): Float32Array {
        const duration = 0.5
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const progress = t / duration

            // Two descending tones (minor second = dissonant)
            const freq1 = 300 * Math.pow(0.5, t * 2)
            const freq2 = 280 * Math.pow(0.5, t * 2)

            const w1 = Math.sin(2 * Math.PI * freq1 * t)
            const w2 = Math.sin(2 * Math.PI * freq2 * t)

            // Fast attack, medium decay
            const env = Math.exp(-t * 4)

            buffer[i] = (w1 * 0.7 + w2 * 0.3) * env * 0.4
        }
        return buffer
    }

    static generateWinSound(): Float32Array {
        // [UPDATE] "Ethereal Swell" (No Sweep/Warp)
        // A warm C Major 9 chord fading in and out slowly
        const duration = 2.5 // Longer, slower
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)
        const env = this.generateEnvelope(len, 0.4, 0.3, 0.3, 0.8) // Very slow attack (0.4s) and release

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Chord: C3, G3, B3, E4 (Major 7/9 feel)
            // No frequency sliding
            const f1 = Math.sin(2 * Math.PI * 130.81 * t) // C3
            const f2 = Math.sin(2 * Math.PI * 196.00 * t) // G3
            const f3 = Math.sin(2 * Math.PI * 246.94 * t) // B3 (Maj7)
            const f4 = Math.sin(2 * Math.PI * 329.63 * t) // E4

            // Detune modulation (Chorus effect)
            const mod = Math.sin(t * 2) * 0.05 + 1.0

            buffer[i] = (f1 + f2 * 0.8 + f3 * 0.6 + f4 * 0.4) * 0.25 * env[i] // [RESTORE] Healthy Amplitude
        }
        return buffer
    }

    static generateSoftCollision(): Float32Array {
        // Soft thud: Low sine burst with rapid decay
        const duration = 0.1
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const freq = 150 - (t * 800) // Pitch drop
            const env = Math.exp(-t * 40)
            const tone = Math.sin(2 * Math.PI * Math.max(0, freq) * t)
            const noise = (Math.random() * 2 - 1) * 0.1

            buffer[i] = (tone + noise) * env * 0.3
        }
        return buffer
    }

    static generateTapSound(): Float32Array {
        // [IMPROVED] Crisp UI click - snappy and satisfying
        const len = Math.floor(SAMPLE_RATE * 0.08)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Two quick tones for a "click" feel
            const tone1 = Math.sin(2 * Math.PI * 2000 * t) * 0.5
            const tone2 = Math.sin(2 * Math.PI * 4000 * t) * 0.3

            // Very fast envelope
            const attack = Math.min(1, t * 200)
            const decay = Math.exp(-t * 80)

            buffer[i] = (tone1 + tone2) * attack * decay * 0.3
        }
        return buffer
    }

    static generateCountdownTick(isFinal: boolean): Float32Array {
        // [IMPROVED] Punchy countdown beeps
        const freq = isFinal ? 1200 : 800
        const duration = isFinal ? 0.25 : 0.15
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE
            const wave = Math.sin(2 * Math.PI * freq * t)
            const attack = Math.min(1, t * 100)
            const decay = Math.exp(-t * (isFinal ? 6 : 15))
            buffer[i] = wave * attack * decay * 0.35
        }
        return buffer
    }

    // [NEW] Creative Music Loops

    static generateMenuMusic(): Float32Array {
        // "Extremely Creative": Ethereal Space Ambient
        // Slow Arpeggio + Deep Drone + White Noise Swells
        const duration = 4.0 // 4s Loop
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // 1. Deep Space Drone (F#2 = 92.5Hz)
            const bass = Math.sin(2 * Math.PI * 92.5 * t) * 0.05 // [FIX] Reduced Drone Volume (0.3 -> 0.05)
            const bassMod = Math.sin(t * 0.5) * 0.5 + 0.5

            // 2. Crystal Plucks (Pentatonic scale on top)
            let note = 0
            const beat = Math.floor(t * 2) // Slow 2 beats/sec
            if (beat % 4 === 0) note = 739.99 // F#5
            if (beat % 4 === 1) note = 880.00 // A5
            if (beat % 4 === 2) note = 1108.73 // C#6
            if (beat % 4 === 3) note = 659.25 // E5

            // Decay envelop for pluck per beat
            const beatTime = t % 0.5
            const pluck = Math.sin(2 * Math.PI * note * t) * Math.exp(-beatTime * 8) * 0.15

            // 3. Subtle Noise Wind - [REMOVE] Deleted to fix persistent ambient noise complaint
            const wind = 0 // (Math.random() * 2 - 1) * 0.005 * (Math.sin(t) * 0.5 + 0.5)

            buffer[i] = (bass * bassMod + pluck + wind) * 0.6
        }
        return buffer
    }

    // [NEW] Chase Loop: Low Pulse Tension
    // [NEW] Chase Loop: Subtle "Wind/Movement" Rush
    static generateChaseLoop(): Float32Array {
        const duration = 2.0 // Shorter loop is fine for noise
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        let lastOut = 0;
        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // White Noise
            const white = Math.random() * 2 - 1;

            // Simple Low Pass Filter (Simulate Brown Noise / Air Drag)
            // Cutoff moves slightly to create "breathing" texture
            const cutoff = 0.1 + Math.sin(t * 1.5) * 0.02

            // Apply filter
            lastOut = lastOut + (white - lastOut) * cutoff

            // Add slight "whine" for velocity feel (High pitched, very quiet)
            const whine = Math.sin(2 * Math.PI * 400 * t) * 0.05

            buffer[i] = (lastOut * 2.0 + whine) * 0.3 // Moderate volume
        }
        return buffer
    }

    static generateGameMusic(): Float32Array {
        // "Journey Instant": ~8 Seconds Seamless Loop
        // 110 BPM
        // 4 Bars = 16 Beats = 16 * (60/110) = 8.7272...
        const duration = 16 * (60 / 110)
        const len = Math.floor(SAMPLE_RATE * duration)
        const buffer = new Float32Array(len)

        const beatLen = 60 / 110
        const barLen = beatLen * 4

        for (let i = 0; i < len; i++) {
            const t = i / SAMPLE_RATE

            // Constant "Flow" State (No Intro/Outro blocks)

            // 1. Soft Pulse Kick
            const beatTime = t % beatLen
            const kickEnv = Math.exp(-beatTime * 15)
            const kick = Math.sin(2 * Math.PI * 50 * beatTime) * kickEnv * 0.4

            // 2. Flowing Arpeggio (C Maj 7)
            const eighth = beatLen / 2
            const step = Math.floor(t / eighth)
            let freq = 261.63 // C4
            const pattern = step % 4
            if (pattern === 1) freq = 329.63 // E4
            if (pattern === 2) freq = 392.00 // G4
            if (pattern === 3) freq = 493.88 // B4

            // Slight variation every 2 bars
            const measure = Math.floor(t / barLen)
            if (measure % 2 === 1) freq *= 0.75 // Shift down slightly

            const noteTime = t % eighth
            const pluckEnv = Math.exp(-noteTime * 5)
            const arp = Math.sin(2 * Math.PI * freq * t) * pluckEnv * 0.15

            // 3. Atmospheric Pad
            const padMod = Math.sin(t * 0.5) * 0.2 + 0.8
            // Simple sustained Cmaj7
            const p1 = Math.sin(2 * Math.PI * 130.81 * t)
            const p2 = Math.sin(2 * Math.PI * 196.00 * t) * 0.5
            const pad = (p1 + p2) * 0.2 * padMod

            // 4. Sparkling Highs - [REMOVE] Removed "Twinkle" as it sounded like noise artifacts
            const twinkle = 0

            buffer[i] = (kick + arp + pad + twinkle) * 0.7
        }
        return buffer
    }

    // Convert Float32 [-1, 1] to WAV Data URI
    static createWavUrl(samples: Float32Array): string {
        const buffer = new ArrayBuffer(44 + samples.length * 2)
        const view = new DataView(buffer)

        // RIFF chunk descriptor
        this.writeString(view, 0, 'RIFF')
        view.setUint32(4, 36 + samples.length * 2, true)
        this.writeString(view, 8, 'WAVE')

        // fmt sub-chunk
        this.writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
        view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
        view.setUint16(22, NUM_CHANNELS, true)
        view.setUint32(24, SAMPLE_RATE, true)
        view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * 2, true) // ByteRate
        view.setUint16(32, NUM_CHANNELS * 2, true) // BlockAlign
        view.setUint16(34, BITS_PER_SAMPLE, true)

        // data sub-chunk
        this.writeString(view, 36, 'data')
        view.setUint32(40, samples.length * 2, true)

        // Write Samples
        let offset = 44
        for (let i = 0; i < samples.length; i++) {
            const s = Math.max(-1, Math.min(1, samples[i]))
            // Convert to 16-bit PCM
            const val = s < 0 ? s * 0x8000 : s * 0x7FFF
            view.setInt16(offset, val, true)
            offset += 2
        }

        // [FIX] Use optimized library instead of manual string loop + btoa
        const binary = encode(buffer)
        return `data:audio/wav;base64,${binary}`
    }

    private static writeString(view: DataView, offset: number, string: string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }
}
