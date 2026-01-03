import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from './ui/Button'

export default function LevelFailedOverlay({ onRetry, onMenu }: { onRetry: () => void, onMenu: () => void }) {
    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, styles.container]}>
                <View style={styles.card}>
                    <Text style={styles.title}>FAILED</Text>
                    <Text style={styles.subtitle}>TRY AGAIN?</Text>

                    <View style={styles.actions}>
                        <Button title="RETRY" onPress={onRetry} variant="primary" size="lg" />
                        <Button title="LEVELS" onPress={onMenu} variant="ghost" />
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    card: {
        width: '80%',
        padding: 30,
        backgroundColor: 'rgba(20,20,30,0.9)',
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,50,50,0.3)'
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ff4444',
        letterSpacing: 4,
        marginBottom: 10
    },
    subtitle: {
        color: '#94a3b8',
        marginBottom: 30,
        letterSpacing: 1
    },
    actions: {
        width: '100%',
        gap: 15
    }
})
