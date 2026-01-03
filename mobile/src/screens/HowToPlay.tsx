import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, BackHandler } from 'react-native'
import { Button } from '../components/ui/Button'

interface HowToPlayProps {
    onBack: () => void
}

export default function HowToPlay({ onBack }: HowToPlayProps) {
    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack()
            return true
        })
        return () => backHandler.remove()
    }, [onBack])

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>HOW TO PLAY</Text>
                <View style={styles.divider} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Step Cards */}
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <View style={[styles.dot, { backgroundColor: '#22d3ee' }]} />
                    </View>
                    <Text style={styles.stepTitle}>MOVE</Text>
                    <Text style={styles.stepDesc}>Drag anywhere on screen to control the Space Ball.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                    </View>
                    <Text style={[styles.stepTitle, { color: '#ef4444' }]}>AVOID</Text>
                    <Text style={styles.stepDesc}>Red obstacles will end your run. Stay alert!</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <View style={[styles.dot, { backgroundColor: '#d946ef' }]} />
                    </View>
                    <Text style={[styles.stepTitle, { color: '#d946ef' }]}>GOAL</Text>
                    <Text style={styles.stepDesc}>Reach the magenta portal to complete the level.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.starsRow}>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.star}>★</Text>
                    </View>
                    <Text style={[styles.stepTitle, { color: '#fbbf24' }]}>RATING</Text>
                    <Text style={styles.stepDesc}>3 Stars = Perfect Run (No Deaths)</Text>
                    <Text style={styles.stepDesc}>2 Stars = 1-2 Deaths</Text>
                    <Text style={styles.stepDesc}>1 Star = Just Survive!</Text>
                </View>

                <Button
                    title="GOT IT"
                    onPress={onBack}
                    size="lg"
                    style={{ marginTop: 10, marginBottom: 40 }}
                />
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
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 4,
        textAlign: 'center',
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: '#22d3ee',
        marginTop: 15,
        opacity: 0.5
    },
    content: {
        flex: 1,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.15)',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    stepTitle: {
        color: '#22d3ee',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        letterSpacing: 2,
    },
    stepDesc: {
        color: '#94a3b8',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 10,
    },
    star: {
        fontSize: 20,
        color: '#fbbf24',
    }
})
