import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { Button } from './ui/Button'
import { AudioManager } from '../core/AudioManager'

export default function LevelCompleteOverlay({ level, stars, onNext, onReplay, onMenu }: {
    level: number,
    stars: number,
    onNext: () => void,
    onReplay: () => void,
    onMenu: () => void
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.9)).current
    const starAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current

    useEffect(() => {
        // Play Win Sound
        // try { AudioManager.getInstance().play('win', 0.8) } catch (e) { } // [REMOVED] Per User Request

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1))
            }),
            Animated.timing(scaleAnim, {
                toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1))
            })
        ]).start(() => {
            // Staggered Star Animation
            const starSequence = starAnims.map((anim, i) => {
                return Animated.sequence([
                    Animated.delay(i * 300),
                    Animated.timing(anim, {
                        toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.bounce
                    })
                ])
            })

            // Play star sounds concurrently with animation delays (mocked by timing)
            starSequence.forEach((seq, i) => {
                if (i < stars) {
                    setTimeout(() => {
                        try { AudioManager.getInstance().play('star', 0.6) } catch (e) { }
                    }, 400 + i * 300)
                }
            })

            Animated.stagger(100, starSequence).start()
        })
    }, [])

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Backdrop with Blur effect simulation (Dark Overlay) */}
            <View style={[StyleSheet.absoluteFill, styles.backdrop]} />

            <View style={[StyleSheet.absoluteFill, styles.container]}>
                <Animated.View style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                        ]
                    }
                ]}>

                    {/* Header Group */}
                    <View style={styles.headerGroup}>
                        <Text style={styles.subtitle}>MISSION ACCOMPLISHED</Text>
                        <Text style={styles.title}>LEVEL {level}</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Stars Section */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3].map((s, i) => (
                            <View key={i} style={styles.starWrapper}>
                                {/* Background Star */}
                                <Text style={styles.starBack}>★</Text>
                                {/* Foreground Star */}
                                {i < stars && (
                                    <Animated.View style={[StyleSheet.absoluteFill, {
                                        opacity: starAnims[i],
                                        transform: [
                                            { scale: starAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 2, 1] }) },
                                            { rotate: starAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] }) }
                                        ]
                                    }]}>
                                        <Text style={styles.starFill}>★</Text>
                                    </Animated.View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Stats or Flavor Text could go here */}

                    <View style={styles.actions}>
                        <Button title="CONTINUE" onPress={onNext} variant="primary" size="lg" />
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}><Button title="REPLAY" onPress={onReplay} variant="secondary" /></View>
                            <View style={{ flex: 1 }}><Button title="LEVELS" onPress={onMenu} variant="secondary" /></View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(0,0,0,0.85)', // Darker for focus
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: 'rgba(25, 25, 35, 0.96)', // Almost solid for readability, deep blue-grey
        borderRadius: 32,
        paddingVertical: 40,
        paddingHorizontal: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
    },
    headerGroup: {
        alignItems: 'center',
        marginBottom: 32,
        width: '100%'
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fbbf24', // Gold
        letterSpacing: 3,
        marginBottom: 8,
        textTransform: 'uppercase',
        opacity: 0.9
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: 16
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center'
    },
    starWrapper: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center'
    },
    starBack: {
        fontSize: 56,
        color: 'rgba(255,255,255,0.05)',
        position: 'absolute'
    },
    starFill: {
        fontSize: 56,
        color: '#fbbf24', // Gold
        textShadowColor: 'rgba(251, 191, 36, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20
    },
    actions: {
        width: '100%',
        gap: 16
    },
    row: {
        flexDirection: 'row',
        gap: 16
    }
})
