import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing } from 'react-native'
import { RemoveAdsModal } from '../components/RemoveAdsModal'
import { usePaymentStore } from '../store/PaymentStore'

interface MainMenuProps {
    onStart: () => void
    onSettings: () => void
    onAchievements: () => void
    onHowToPlay: () => void
}

export default function MainMenu({ onStart, onSettings, onAchievements, onHowToPlay }: MainMenuProps) {
    // Remove Ads Modal State
    const [showRemoveAdsModal, setShowRemoveAdsModal] = useState(false)
    const { requestPurchase, restorePurchases, hasRemovedAds } = usePaymentStore()

    // Animated orbs
    const orb1Y = useRef(new Animated.Value(0)).current
    const orb2Y = useRef(new Animated.Value(0)).current
    const orb3Y = useRef(new Animated.Value(0)).current
    const orb1Scale = useRef(new Animated.Value(1)).current
    const orb2Scale = useRef(new Animated.Value(1)).current

    useEffect(() => {
        // Floating animation for orb 1
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb1Y, { toValue: -30, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orb1Y, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
            ])
        ).start()

        // Floating animation for orb 2
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb2Y, { toValue: 40, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orb2Y, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
            ])
        ).start()

        // Floating animation for orb 3
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb3Y, { toValue: -20, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orb3Y, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
            ])
        ).start()

        // Pulsing for orb 1
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb1Scale, { toValue: 1.2, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(orb1Scale, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
            ])
        ).start()

        // Pulsing for orb 2
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb2Scale, { toValue: 1.3, duration: 4000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(orb2Scale, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
            ])
        ).start()
    }, [])

    return (
        <View style={styles.container}>
            {/* Animated Background Orbs */}
            <Animated.View style={[styles.orb, {
                width: 250,
                height: 250,
                backgroundColor: '#22d3ee',
                opacity: 0.2,
                top: -50,
                left: -50,
                transform: [{ translateY: orb1Y }, { scale: orb1Scale }]
            }]} />

            <Animated.View style={[styles.orb, {
                width: 300,
                height: 300,
                backgroundColor: '#ec4899',
                opacity: 0.15,
                bottom: -100,
                right: -80,
                transform: [{ translateY: orb2Y }, { scale: orb2Scale }]
            }]} />

            <Animated.View style={[styles.orb, {
                width: 180,
                height: 180,
                backgroundColor: '#22d3ee',
                opacity: 0.08,
                top: '40%',
                right: -60,
                transform: [{ translateY: orb3Y }]
            }]} />

            {/* Content */}
            <View style={styles.content}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>SPACE BALLS</Text>
                    <Text style={styles.titleGo}>GO!</Text>
                    <View style={styles.divider} />
                    <Text style={styles.subtitle}>JOURNEY THROUGH THE VOID</Text>
                </View>

                {/* Glass Button Container */}
                <View style={styles.glassPanel}>
                    <TouchableOpacity onPress={onStart} style={[styles.button, styles.primaryButton]}>
                        <Text style={[styles.buttonText, styles.primaryButtonText]}>▶  PLAY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            if (hasRemovedAds) {
                                Alert.alert('Already Unlocked', 'You have already removed ads. Enjoy!')
                            } else {
                                setShowRemoveAdsModal(true)
                            }
                        }}
                        style={[styles.button, hasRemovedAds && styles.purchasedButton]}
                    >
                        <Text style={styles.buttonText}>
                            {hasRemovedAds ? '✓  ADS REMOVED' : '💎  NO ADS'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onHowToPlay} style={styles.button}>
                        <Text style={styles.buttonText}>?  HOW TO PLAY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onSettings} style={styles.button}>
                        <Text style={styles.buttonText}>⚙  SETTINGS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onAchievements} style={styles.button}>
                        <Text style={styles.buttonText}>🏆  TROPHIES</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>v1.1.0</Text>
            </View>

            {/* Remove Ads Modal */}
            <RemoveAdsModal
                visible={showRemoveAdsModal}
                onClose={() => setShowRemoveAdsModal(false)}
                onBuy={() => {
                    requestPurchase('remove_ads')
                    setShowRemoveAdsModal(false)
                }}
                onRestore={() => {
                    restorePurchases()
                    setShowRemoveAdsModal(false)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 10,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 38,
        fontWeight: '900',
        color: '#22d3ee',
        letterSpacing: 8,
        textShadowColor: 'rgba(34, 211, 238, 0.8)',
        textShadowRadius: 30,
        textShadowOffset: { width: 0, height: 0 },
    },
    titleGo: {
        fontSize: 48,
        fontWeight: '900',
        color: '#ec4899',
        letterSpacing: 10,
        marginTop: -5,
        textShadowColor: 'rgba(236, 72, 153, 0.8)',
        textShadowRadius: 30,
        textShadowOffset: { width: 0, height: 0 },
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: '#22d3ee',
        marginTop: 15,
        marginBottom: 15,
    },
    subtitle: {
        color: '#64748b',
        fontSize: 14,
        letterSpacing: 4,
        fontWeight: '600',
    },
    glassPanel: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 24,
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(71, 85, 105, 0.4)',
        width: '90%',
        gap: 12,
    },
    button: {
        backgroundColor: 'rgba(51, 65, 85, 0.6)',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(71, 85, 105, 0.5)',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#22d3ee',
        borderColor: '#22d3ee',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
    },
    primaryButtonText: {
        fontSize: 18,
        color: '#0a0f1a',
    },
    version: {
        color: '#475569',
        fontSize: 12,
        marginTop: 30,
        letterSpacing: 2,
    },
    purchasedButton: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 0.5)',
    },
})
