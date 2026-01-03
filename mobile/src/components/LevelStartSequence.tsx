import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'

export const LevelStartSequence = ({ count, visible, level, ruleName }: { count: number | string | null, visible: boolean, level: number, ruleName: string }) => {
    // Cinematic Redesign: No Ring, Giant Numbers, robust Key-based animation.
    if (!visible) return null
    if (count === null || count === '') return null

    const showTitle = typeof count === 'number' && count > 3
    const showCount = (typeof count === 'number' && count <= 3) || count === 'GO!'

    return (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 50 }]}>
            {/* Dark Backdrop */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

            {/* Title Card (Phase 1) */}
            {showTitle && <AnimatedTitle level={level} ruleName={ruleName} />}

            {/* Countdown (Phase 2) */}
            {showCount && <AnimatedCount key={count} count={count} />}
        </View>
    )
}

const AnimatedCount = ({ count }: { count: string | number }) => {
    const scale = useRef(new Animated.Value(3)).current
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.poly(4)) }),
            Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true })
        ]).start()
    }, [])

    return (
        <Animated.Text style={{
            fontSize: 160, fontWeight: '100', color: 'white',
            textShadowColor: 'rgba(34, 211, 238, 0.8)', textShadowRadius: 30,
            transform: [{ scale }], opacity,
            includeFontPadding: false
        }}>
            {count}
        </Animated.Text>
    )
}

const AnimatedTitle = ({ level, ruleName }: { level: number, ruleName: string }) => {
    const fade = useRef(new Animated.Value(0)).current
    const slide = useRef(new Animated.Value(20)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slide, { toValue: 0, friction: 8, useNativeDriver: true })
        ]).start()
    }, [])

    // Don't show "Normal Movement" as a rule name
    const showRuleName = ruleName && ruleName.toLowerCase() !== 'normal movement'

    return (
        <Animated.View style={{
            alignItems: 'center', opacity: fade, transform: [{ translateY: slide }],
            backgroundColor: 'rgba(15, 23, 42, 0.95)', paddingVertical: 30, paddingHorizontal: 60,
            borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)'
        }}>
            <Text style={{ color: '#64748b', fontSize: 28, letterSpacing: 8, fontWeight: '600', marginBottom: showRuleName ? 10 : 0 }}>LEVEL {level}</Text>
            {showRuleName && (
                <Text style={{ color: '#22d3ee', fontSize: 32, fontWeight: '200', textTransform: 'uppercase', letterSpacing: 4 }}>
                    {ruleName}
                </Text>
            )}
        </Animated.View>
    )
}
