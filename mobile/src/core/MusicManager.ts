import { Audio } from 'expo-av';
import { SoundGenerator } from './SoundGenerator';

type BackgroundTrack = 'menu' | 'game' | 'none';

export class MusicManager {
    private static currentTrack: BackgroundTrack = 'none';
    private static soundObject: Audio.Sound | null = null;
    private static isMuted: boolean = false;

    // Cache generated URIs so we don't regenerate every switch
    private static menuMusicUri: string | null = null;
    private static gameMusicUri: string | null = null;

    // [PERF] Pre-loaded Sound objects to prevent freeze on track switch
    private static menuSoundObject: Audio.Sound | null = null;
    private static gameSoundObject: Audio.Sound | null = null;

    // [PERF] Pre-loaded SFX Sound objects
    private static starSound: Audio.Sound | null = null;
    private static winSound: Audio.Sound | null = null;
    private static failSound: Audio.Sound | null = null;
    private static tapSound: Audio.Sound | null = null;

    private static isInitialized = false;

    private static isDucked: boolean = false;
    private static chaseSoundObject: Audio.Sound | null = null;
    private static chaseUri: string | null = null;

    private static lastChaseVol: number = 0;

    // [NEW] Dynamic Chase Audio
    static async setChaseVolume(intensity: number) {
        // intensity: 0.0 (Silent) -> 1.0 (Max Chase)
        if (!this.chaseSoundObject) {
            // Lazy Load
            if (!this.chaseUri) {
                const buffer = SoundGenerator.generateChaseLoop();
                this.chaseUri = SoundGenerator.createWavUrl(buffer);
            }
            try {
                // [FIX] Init with tiny volume (0.01) so it doesn't get optimized out/paused by Android
                const { sound } = await Audio.Sound.createAsync(
                    { uri: this.chaseUri },
                    { isLooping: true, volume: 0.01, shouldPlay: true }
                );
                this.chaseSoundObject = sound;
                // [FIX] Force Play
                await sound.playAsync();
            } catch (e) { return; }
        }

        try {
            const { useGameStore } = require('../store/gameStore');
            const { sfxVolume } = useGameStore.getState().settings;
            if (sfxVolume <= 0) {
                if (this.lastChaseVol !== 0) {
                    await this.chaseSoundObject.setVolumeAsync(0);
                    this.lastChaseVol = 0;
                }
                return;
            }

            // Cap volume at 0.5 * sfxVolume (Subtle Background)
            const targetVol = intensity * sfxVolume * 0.5;

            // [FIX] Throttling: Only update if change is significant (> 5% or becoming 0)
            if (Math.abs(targetVol - this.lastChaseVol) > 0.05 || (targetVol === 0 && this.lastChaseVol !== 0)) {
                await this.chaseSoundObject.setVolumeAsync(targetVol);
                this.lastChaseVol = targetVol;
            }
        } catch (e) { }
    }

    // [NEW] Ducking Control (Lowers music by 50%)
    static async duckMusic(active: boolean) {
        if (this.isDucked === active) return;
        this.isDucked = active;

        if (this.soundObject && !this.isMuted) {
            const { useGameStore } = require('../store/gameStore');
            const { masterVolume } = useGameStore.getState().settings;
            if (masterVolume <= 0) return;

            const track = this.currentTrack;
            const baseVol = track === 'menu' ? 0.4 : 0.3;
            // Apply Ducking Factor (0.5) if active
            const duckFactor = this.isDucked ? 0.5 : 1.0;

            try {
                await this.soundObject.setVolumeAsync(baseVol * masterVolume * duckFactor);
            } catch (e) { }
        }
    }

    static async setMasterVolume(vol: number) {
        if (!this.soundObject) return

        const track = this.currentTrack
        // [FIX] Lowered by ~30% (0.4 -> 0.28, 0.3 -> 0.21)
        const baseVol = track === 'menu' ? 0.28 : 0.21
        const duckFactor = this.isDucked ? 0.5 : 1.0; // [FIX] Respect Ducking on Volume Change

        try {
            if (vol <= 0) {
                console.log("Stopping Music (Vol 0)")
                await this.soundObject.setVolumeAsync(0)
                await this.soundObject.stopAsync()
            } else {
                console.log("Resuming Music (Vol > 0)")
                await this.soundObject.setVolumeAsync(baseVol * vol * duckFactor)
                const status = await this.soundObject.getStatusAsync()
                if (status.isLoaded && !status.isPlaying) {
                    await this.soundObject.replayAsync()
                }
            }
        } catch (e) {
            console.warn("Audio Update Failed", e)
            // Retry load
            this.soundObject = null
            const savedTrack = this.currentTrack
            this.currentTrack = 'none'
            await this.playTrack(savedTrack)
        }
    }

    static async init() {
        if (this.isInitialized) return;

        // [FIX] Ensure Audio Engine is ready
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false
            });
        } catch (e) { }

        this.isInitialized = true;
        await this.load();
    }

    static async load() {
        // Pre-generate heavily compute-intensive loops
        try {
            console.log('Generating Music...');
            const menuBuffer = SoundGenerator.generateMenuMusic();
            this.menuMusicUri = SoundGenerator.createWavUrl(menuBuffer);

            const gameBuffer = SoundGenerator.generateGameMusic();
            this.gameMusicUri = SoundGenerator.createWavUrl(gameBuffer);

            // [PERF] Pre-load Sound objects to prevent freeze on track switch
            console.log('Pre-loading Music Sounds...');
            const { sound: menuSound } = await Audio.Sound.createAsync(
                { uri: this.menuMusicUri },
                { isLooping: true, volume: 0, shouldPlay: false }
            );
            this.menuSoundObject = menuSound;

            const { sound: gameSound } = await Audio.Sound.createAsync(
                { uri: this.gameMusicUri },
                { isLooping: true, volume: 0, shouldPlay: false }
            );
            this.gameSoundObject = gameSound;
            console.log('Music Pre-loaded!');

            // [PERF] Pre-load SFX sounds
            console.log('Pre-loading SFX...');
            const starBuffer = SoundGenerator.generateStarSound();
            const starUri = SoundGenerator.createWavUrl(starBuffer);
            const { sound: starSnd } = await Audio.Sound.createAsync({ uri: starUri }, { volume: 0.3 });
            this.starSound = starSnd;

            const winBuffer = SoundGenerator.generateWinSound();
            const winUri = SoundGenerator.createWavUrl(winBuffer);
            const { sound: winSnd } = await Audio.Sound.createAsync({ uri: winUri }, { volume: 0.3 });
            this.winSound = winSnd;

            const failBuffer = SoundGenerator.generateFailSound();
            const failUri = SoundGenerator.createWavUrl(failBuffer);
            const { sound: failSnd } = await Audio.Sound.createAsync({ uri: failUri }, { volume: 0.3 });
            this.failSound = failSnd;

            const tapBuffer = SoundGenerator.generateTapSound();
            const tapUri = SoundGenerator.createWavUrl(tapBuffer);
            const { sound: tapSnd } = await Audio.Sound.createAsync({ uri: tapUri }, { volume: 0.3 });
            this.tapSound = tapSnd;

            console.log('SFX Pre-loaded!');
        } catch (e) {
            console.error('Failed to generate music:', e);
        }
    }

    static async playTrack(track: BackgroundTrack) {
        if (this.currentTrack === track) return;
        if (this.isMuted) return;

        // Stop current track (just pause, don't unload since we've pre-loaded)
        if (this.soundObject) {
            try {
                await this.soundObject.pauseAsync();
                await this.soundObject.setPositionAsync(0);  // Reset to start
            } catch (e) { }
        }

        this.currentTrack = track;
        if (track === 'none') return;

        // [PERF] Use pre-loaded Sound objects instead of creating new ones
        const sound = track === 'menu' ? this.menuSoundObject : this.gameSoundObject;
        if (!sound) {
            console.warn('Music not pre-loaded yet');
            return;
        }

        try {
            const { useGameStore } = require('../store/gameStore');
            const { masterVolume } = useGameStore.getState().settings;
            const baseVol = track === 'menu' ? 0.28 : 0.21;
            const duckFactor = this.isDucked ? 0.5 : 1.0;

            await sound.setVolumeAsync(baseVol * masterVolume * duckFactor);

            // Slow down menu music tempo for more relaxed ambient feel
            if (track === 'menu') {
                await sound.setRateAsync(0.85, true); // 15% slower, with pitch correction
            } else {
                await sound.setRateAsync(1.0, true); // Normal speed for game music
            }

            await sound.playAsync();
            this.soundObject = sound;  // Track current for ducking/volume changes
        } catch (e) {
            console.error('Error playing track:', e);
        }
    }

    private static countdownSound: Audio.Sound | null = null;
    private static countdownFinalSound: Audio.Sound | null = null;

    // SFX One-shots (Fire and Forget)
    static async playSFX(type: 'star' | 'tap' | 'win' | 'countdown' | 'countdown_final' | 'fail') {
        if (this.isMuted) return;

        const { useGameStore } = require('../store/gameStore');
        const { sfxVolume } = useGameStore.getState().settings;
        if (sfxVolume <= 0) return;

        let finalVol = sfxVolume * 0.6;
        if (type === 'win' || type === 'star') finalVol *= 0.5;

        try {
            // [FIX] Cache Countdown Sounds to prevent Android Bridge Crash
            if (type === 'countdown') {
                if (this.countdownSound) {
                    await this.countdownSound.replayAsync();
                    return;
                }
                // Load First Time
                const buffer = SoundGenerator.generateCountdownTick(false);
                const uri = SoundGenerator.createWavUrl(buffer);
                const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: finalVol });
                this.countdownSound = sound;
                return;
            }

            if (type === 'countdown_final') {
                if (this.countdownFinalSound) {
                    await this.countdownFinalSound.replayAsync();
                    return;
                }
                const buffer = SoundGenerator.generateCountdownTick(true);
                const uri = SoundGenerator.createWavUrl(buffer);
                const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: finalVol });
                this.countdownFinalSound = sound;
                return;
            }

            // [PERF] Use pre-loaded SFX sounds
            let sound: Audio.Sound | null = null;
            switch (type) {
                case 'star': sound = this.starSound; break;
                case 'win': sound = this.winSound; break;
                case 'fail': sound = this.failSound; break;
                case 'tap': sound = this.tapSound; break;
                default: return;
            }

            if (!sound) {
                console.warn(`SFX ${type} not pre-loaded yet`);
                return;
            }

            await sound.setVolumeAsync(finalVol);
            await sound.stopAsync();  // Stop any currently playing sound
            await sound.setPositionAsync(0);  // Reset to start
            await sound.playAsync();
        } catch (e) {
            console.error('SFX Error:', e);
        }
    }

    static toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            if (this.soundObject) this.soundObject.stopAsync();
        } else {
            // Resume current track
            const track = this.currentTrack;
            this.currentTrack = 'none'; // Force reload
            this.playTrack(track);
        }
        return this.isMuted;
    }
}
