import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from './ui/Button'

export default function GamePauseOverlay({ onResume, onReset, onQuit, onFullReset }: { onResume: () => void, onReset: () => void, onQuit: () => void, onFullReset?: () => void }) {
    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, styles.container]}>
                <View style={styles.card}>
                    <Text style={styles.title}>PAUSED</Text>

                    <View style={styles.actions}>
                        <Button title="RESUME" onPress={onResume} variant="primary" size="lg" />
                        <Button title="RESTART LEVEL" onPress={onReset} variant="secondary" />
                        <Button title="QUIT TO MENU" onPress={onQuit} variant="ghost" />
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
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    card: {
        width: '80%',
        padding: 40,
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 4,
        marginBottom: 40
    },
    actions: {
        width: '100%',
        gap: 15
    }
})
