import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from './ui/Button'

export default function GameCompleteScreen({ onBack }: { onBack: () => void }) {
    return (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
            <Text style={styles.title}>Space Balls GO! COMPLETE</Text>
            <Text style={styles.subtitle}>You have finished all levels.</Text>
            <Button title="RETURN TO MENU" onPress={onBack} variant="primary" size="lg" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'gold',
        marginBottom: 20,
        textAlign: 'center'
    },
    subtitle: {
        color: 'white',
        marginBottom: 40
    }
})
