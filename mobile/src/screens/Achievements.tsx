import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, BackHandler, Animated, TouchableOpacity, Platform } from 'react-native'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
// import { PlayGamesService } from '../services/PlayGamesService' // Temporarily disabled

interface AchievementsProps {
    onBack: () => void
}

// Animated trophy card component
const TrophyCard = ({ item, delay }: { item: any, delay: number }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current
    const glowAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // Entrance animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            delay: delay,
            useNativeDriver: true
        }).start()

        // Pulse glow for unlocked trophies
        if (!item.locked) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
                ])
            ).start()
        }
    }, [item.locked])

    const borderOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.15, 0.4]
    })

    return (
        <Animated.View style={[
            styles.card,
            item.locked && styles.cardLocked,
            { transform: [{ scale: scaleAnim }] }
        ]}>
            {/* Subtle glow border for unlocked */}
            {!item.locked && (
                <Animated.View style={[
                    StyleSheet.absoluteFill,
                    {
                        borderWidth: 1,
                        borderColor: '#22d3ee',
                        opacity: borderOpacity,
                        borderRadius: 16
                    }
                ]} />
            )}

            <View style={[styles.iconBox, item.locked && styles.iconLocked]}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                {/* Checkmark for unlocked */}
                {!item.locked && (
                    <View style={styles.checkBadge}>
                        <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                    </View>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, item.locked && { color: '#475569' }]}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
                {!item.locked && <Text style={styles.unlocked}>ACHIEVED</Text>}
            </View>

            {item.locked && <Text style={{ opacity: 0.4 }}>🔒</Text>}
        </Animated.View>
    )
}

export default function Achievements({ onBack }: AchievementsProps) {
    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack()
            return true
        })
        return () => backHandler.remove()
    }, [onBack])

    const levelProgress = useGameStore(state => state.levelProgress)
    const totalFailures = useGameStore(state => state.totalFailures)

    // Derived Progress
    const completedL1 = levelProgress[1]?.stars > 0
    const completedL25 = levelProgress[25]?.stars > 0
    const survivorUnlocked = totalFailures >= 50

    const data = [
        { id: 1, title: 'First Launch', desc: 'Complete Level 1', locked: !completedL1, icon: '🚀' },
        { id: 2, title: 'Hyperspeed', desc: 'Complete any level in < 5s', locked: true, icon: '⚡' },
        { id: 3, title: 'Space Debris', desc: 'Die 50 times', locked: !survivorUnlocked, icon: '💥' },
        { id: 4, title: 'Galaxy Voyager', desc: 'Reach Level 25', locked: !completedL25, icon: '🌌' },
        { id: 5, title: 'Commander', desc: 'Get 3 Stars on 5 Levels', locked: Object.values(levelProgress).filter(l => l.stars === 3).length < 5, icon: '👑' },
    ]

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>TROPHIES</Text>
                    <View style={styles.divider} />
                </View>
                <Button title="✕" onPress={onBack} variant="ghost" size="sm" />
            </View>

            {/* Google Play Games Button - Temporarily disabled
            {Platform.OS === 'android' && (
                <TouchableOpacity
                    style={styles.playGamesButton}
                    onPress={() => PlayGamesService.showAchievements()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.playGamesIcon}>🎮</Text>
                    <Text style={styles.playGamesText}>View on Google Play</Text>
                </TouchableOpacity>
            )}
            */}

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {data.map((item, index) => (
                    <TrophyCard key={item.id} item={item} delay={index * 80} />
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 4,
    },
    divider: {
        width: 50,
        height: 2,
        backgroundColor: '#22d3ee',
        marginTop: 10,
        opacity: 0.5
    },
    list: {
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.15)',
        overflow: 'hidden'
    },
    cardLocked: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconLocked: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardTitle: {
        color: '#22d3ee',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
        marginBottom: 3,
    },
    cardDesc: {
        color: '#94a3b8',
        fontSize: 12,
    },
    unlocked: {
        color: '#10b981',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        letterSpacing: 1
    },
    checkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1e293b'
    },
    playGamesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    playGamesIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    playGamesText: {
        color: '#22c55e',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    }
})
