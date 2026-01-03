import React, { useEffect, useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, View } from 'react-native'
import { MusicManager } from '../../core/MusicManager'

interface ButtonProps {
    title: string
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
    icon?: string
    style?: ViewStyle
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', size = 'md', icon, style }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current
    const glowAnim = useRef(new Animated.Value(0)).current

    // [FIX] Removed Glow Animation to prevent text disappearance glitch on Android
    // The complex Animated.loop + absoluteFill overlay was causing z-index issues.

    /* 
    useEffect(() => {
        if (variant === 'primary') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false })
                ])
            ).start()
        }
    }, [variant])
    */

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()
    }

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()
    }

    const getBgColor = () => {
        switch (variant) {
            case 'primary': return '#0891b2' // Cyan-600
            case 'secondary': return 'rgba(255, 255, 255, 0.1)'
            case 'ghost': return 'transparent'
            case 'destructive': return '#ef4444' // Solid Red
            default: return '#0891b2'
        }
    }

    const getTextColor = () => {
        switch (variant) {
            case 'primary': return '#fff'
            case 'secondary': return '#22d3ee' // Cyan-400
            case 'ghost': return '#94a3b8' // Slate-400
            case 'destructive': return '#fff' // White text
            default: return '#fff'
        }
    }

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 }
            case 'lg': return { paddingVertical: 16, paddingHorizontal: 32 }
            default: return { paddingVertical: 12, paddingHorizontal: 24 }
        }
    }

    const glowColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(34, 211, 238, 0)', 'rgba(34, 211, 238, 0.5)']
    })

    const handlePress = () => {
        try { MusicManager.playSFX('tap') } catch (e) { }
        onPress()
    }

    return (
        <View style={style}>
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={[
                    styles.button,
                    { backgroundColor: getBgColor(), ...getPadding() },
                    variant === 'secondary' && styles.border,
                    variant === 'destructive' && styles.borderRed,
                    variant === 'primary' && styles.shadow
                ]}
            >
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[styles.text, { color: getTextColor(), fontSize: size === 'lg' ? 18 : 14 }]}
                >
                    {icon && <Text>{icon}  </Text>}
                    {title.toUpperCase()}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    border: {
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
    },
    borderRed: {
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    shadow: {
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    text: {
        fontWeight: 'bold',
        letterSpacing: 2,
    }
})
