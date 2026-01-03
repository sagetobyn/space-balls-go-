import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { SoundGenerator } from './SoundGenerator'

type SoundKey = 'jump' | 'crash' | 'win' | 'tick' | 'star' | 'fail'

export class AudioManager {
    private static instance: AudioManager
    private sounds: { [key in SoundKey]?: Audio.Sound } = {}
    private isInitialized = false

    private constructor() { }

    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager()
        }
        return AudioManager.instance
    }

    async init() {
        if (this.isInitialized) return

        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Generate Sounds
            const jumpWav = SoundGenerator.createWavUrl(SoundGenerator.generateJump())
            const crashWav = SoundGenerator.createWavUrl(SoundGenerator.generateExplosion())
            const winWav = SoundGenerator.createWavUrl(SoundGenerator.generateTone(880, 0.5, 'sine')) // A5
            const tickWav = SoundGenerator.createWavUrl(SoundGenerator.generateSoftCollision())
            const starWav = SoundGenerator.createWavUrl(SoundGenerator.generateStarSound()) // Improved star collect sound
            const failWav = SoundGenerator.createWavUrl(SoundGenerator.generateFailSound()) // [NEW] Soft Fail

            // Load Sounds
            this.sounds.jump = await this.loadSound(jumpWav)
            this.sounds.crash = await this.loadSound(crashWav)
            this.sounds.win = await this.loadSound(winWav)
            this.sounds.tick = await this.loadSound(tickWav)
            this.sounds.star = await this.loadSound(starWav)
            this.sounds.fail = await this.loadSound(failWav)

            this.isInitialized = true
            console.log("AudioManager Initialized")
        } catch (e) {
            console.warn("Audio Init Failed:", e)
        }
    }

    private async loadSound(uri: string): Promise<Audio.Sound | undefined> {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri })
            return sound
        } catch (e) {
            console.warn("Failed to load sound", e)
            return undefined
        }
    }

    async play(key: SoundKey, rate: number = 1.0) {
        if (!this.isInitialized) return
        const sound = this.sounds[key]
        if (sound) {
            try {
                // [FIX] Independent SFX Volume
                // "Music" button toggles masterVolume, so we shouldn't use it for SFX.
                const { sfxVolume } = require('../store/gameStore').useGameStore.getState().settings

                if (sfxVolume <= 0) return // Skip if SFX is muted in settings

                // [FIX] Reset to sane global level (60% of max)
                let finalVolume = sfxVolume * 0.6

                // [FIX] Gentle reduction for 'win' and 'star' (50% of base)
                if (key === 'win' || key === 'star') {
                    finalVolume *= 0.5
                }

                // Replay async: reset then play
                // [FIX] Force explicit volume set
                await sound.setVolumeAsync(finalVolume)
                await sound.replayAsync({ rate: rate, shouldCorrectPitch: true })
            } catch (e) {
                // Ignore play errors
            }
        }
    }

    haptic(type: 'light' | 'medium' | 'heavy' | 'success') {
        try {
            // Check if haptics are enabled in settings
            const { hapticsEnabled } = require('../store/gameStore').useGameStore.getState().settings
            if (!hapticsEnabled) return

            if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } catch (e) {
            // Haptics might fail on web or some devices
        }
    }
}
