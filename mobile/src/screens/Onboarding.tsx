import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native'
import { useGameStore } from '../store/gameStore'

const { width, height } = Dimensions.get('window')

interface OnboardingProps {
    onComplete: () => void
}

const STEPS = [
    {
        title: 'WELCOME TO',
        subtitle: 'SPACE BALLS GO!',
        description: 'Navigate through 50 exciting levels filled with cosmic obstacles!',
        icon: '🚀',
        color: '#22d3ee',
    },
    {
        title: 'DRAG TO MOVE',
        subtitle: 'Your finger is the controller',
        description: 'Touch and drag anywhere on the screen to guide your glowing ball.',
        icon: '👆',
        color: '#22d3ee',
    },
    {
        title: 'AVOID RED',
        subtitle: 'Obstacles are deadly!',
        description: 'Red obstacles will end your run. Stay alert and time your moves!',
        icon: '🔴',
        color: '#ef4444',
    },
    {
        title: 'REACH THE GOAL',
        subtitle: 'Find the exit portal',
        description: 'Navigate to the glowing magenta portal to complete each level.',
        icon: '🟣',
        color: '#d946ef',
    },
    {
        title: 'COLLECT STARS',
        subtitle: 'Perfect runs = 3 stars!',
        description: 'Complete levels without dying to earn maximum stars. Can you get them all?',
        icon: '⭐',
        color: '#fbbf24',
    },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const setOnboardingComplete = useGameStore(state => state.actions.setOnboardingComplete)

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        // Animate in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start()

        // Pulse animation for icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [currentStep])

    const handleNext = () => {
        // Animate out
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (currentStep < STEPS.length - 1) {
                setCurrentStep(currentStep + 1)
                slideAnim.setValue(50)
            } else {
                setOnboardingComplete()
                onComplete()
            }
        })
    }

    const handleSkip = () => {
        setOnboardingComplete()
        onComplete()
    }

    const step = STEPS[currentStep]
    const isLastStep = currentStep === STEPS.length - 1

    return (
        <View style={styles.container}>
            {/* Background orbs */}
            <View style={[styles.orb, { backgroundColor: step.color, opacity: 0.15, top: -100, left: -100 }]} />
            <View style={[styles.orb, { backgroundColor: '#ec4899', opacity: 0.1, bottom: -80, right: -80 }]} />

            {/* Skip button */}
            {!isLastStep && (
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Content */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* Icon */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <Text style={styles.icon}>{step.icon}</Text>
                </Animated.View>

                {/* Title */}
                <Text style={[styles.title, { color: step.color }]}>{step.title}</Text>
                <Text style={styles.subtitle}>{step.subtitle}</Text>

                {/* Description */}
                <Text style={styles.description}>{step.description}</Text>
            </Animated.View>

            {/* Progress dots */}
            <View style={styles.dotsContainer}>
                {STEPS.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentStep && { backgroundColor: step.color, width: 24 }
                        ]}
                    />
                ))}
            </View>

            {/* Next button */}
            <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: step.color }]}
                onPress={handleNext}
                activeOpacity={0.8}
            >
                <Text style={styles.nextBtnText}>
                    {isLastStep ? 'LET\'S GO!' : 'NEXT'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0f1a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    skipBtn: {
        position: 'absolute',
        top: 60,
        right: 25,
        padding: 10,
    },
    skipText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    icon: {
        fontSize: 50,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 4,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 26,
        fontWeight: '900',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 140,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#334155',
    },
    nextBtn: {
        position: 'absolute',
        bottom: 60,
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 12,
    },
    nextBtnText: {
        color: '#0a0f1a',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
})
