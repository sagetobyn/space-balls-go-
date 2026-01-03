import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import GameScreen from './src/GameScreen'
import HomeScreen from './src/HomeScreen'
import MainMenu from './src/screens/MainMenu'
import Settings from './src/screens/Settings'
import Achievements from './src/screens/Achievements'
import HowToPlay from './src/screens/HowToPlay'
import { useGameStore } from './src/store/gameStore'
import { MusicManager } from './src/core/MusicManager'
// import { PlayGamesService } from './src/services/PlayGamesService' // Temporarily disabled

type ScreenState = 'splash' | 'menu' | 'levels' | 'game' | 'settings' | 'achievements' | 'how_to_play'

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('splash')
  const startLevel = useGameStore(state => state.actions.startLevel)
  const [isAudioReady, setIsAudioReady] = useState(false)

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('menu')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Audio and IAP initialization
  useEffect(() => {
    const initAudio = async () => {
      try {
        await MusicManager.init()
        // Start menu music immediately after init
        MusicManager.playTrack('menu')
        const { AudioManager } = require('./src/core/AudioManager')
        await AudioManager.getInstance().init()
        const { AdManager } = require('./src/core/AdManager')
        AdManager.init()
        // Initialize In-App Purchases
        const { usePaymentStore, setupPurchaseListeners } = require('./src/store/PaymentStore')
        usePaymentStore.getState().initialize()
        const cleanupListeners = setupPurchaseListeners()
        // Initialize Google Play Games Services
        // PlayGamesService.init() // Temporarily disabled
        setIsAudioReady(true)

        // Return cleanup function
        return cleanupListeners
      } catch (e) {
        console.warn('Audio init failed:', e)
      }
    }

    let cleanup: (() => void) | undefined
    initAudio().then(c => { cleanup = c })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  useEffect(() => {
    if (!isAudioReady) return
    if (screen === 'menu') {
      MusicManager.playTrack('menu')
    }
  }, [screen, isAudioReady])

  const handleLevelSelect = (level: number) => {
    startLevel(level)
    setScreen('game')
  }

  return (
    <View style={styles.container}>
      {screen === 'splash' && (
        <View style={styles.splashContainer}>
          <Text style={styles.splashTitle}>HASSIUM LABS</Text>
          <Text style={styles.splashSubtitle}>presents</Text>
        </View>
      )}

      {screen === 'menu' && (
        <MainMenu
          onStart={() => setScreen('levels')}
          onSettings={() => setScreen('settings')}
          onAchievements={() => setScreen('achievements')}
          onHowToPlay={() => setScreen('how_to_play')}
        />
      )}

      {screen === 'levels' && (
        <HomeScreen
          onLevelSelect={handleLevelSelect}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'game' && <GameScreen onBack={() => setScreen('levels')} onQuitToMenu={() => setScreen('menu')} />}
      {screen === 'settings' && <Settings onBack={() => setScreen('menu')} />}
      {screen === 'achievements' && <Achievements onBack={() => setScreen('menu')} />}
      {screen === 'how_to_play' && <HowToPlay onBack={() => setScreen('menu')} />}

      <StatusBar style="light" hidden />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    color: '#22d3ee',
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  splashSubtitle: {
    color: '#475569',
    fontSize: 13,
    letterSpacing: 4,
    marginTop: 12,
  }
})
