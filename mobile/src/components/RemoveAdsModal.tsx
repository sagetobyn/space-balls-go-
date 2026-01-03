import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native'
import { Button } from './ui/Button'
{/* Reusing the Button component ensures consistency */ }

interface RemoveAdsModalProps {
    visible: boolean
    onClose: () => void
    onBuy: () => void
    onRestore: () => void
}

const { width, height } = Dimensions.get('window')

export const RemoveAdsModal = ({ visible, onClose, onBuy, onRestore }: RemoveAdsModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Glow Effect behind */}
                    <View style={styles.glow} />

                    <View style={styles.content}>
                        <Text style={styles.icon}>💎</Text>
                        <Text style={styles.title}>REMOVE ADS</Text>
                        <View style={styles.divider} />

                        <Text style={styles.description}>
                            Experience the void without interruptions.
                        </Text>
                        <Text style={styles.subDescription}>
                            Support development and play forever.
                        </Text>

                        <View style={styles.actions}>
                            <Button
                                title="UNLOCK FOREVER - $4.99"
                                onPress={onBuy}
                                size="lg"
                                style={{ width: '100%', marginBottom: 15 }}
                            />

                            <TouchableOpacity onPress={onRestore} style={{ padding: 10 }}>
                                <Text style={styles.restoreLink}>Restore Purchase</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeText}>Maybe Later</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.9)', // Deep dark blue/black
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: Math.min(width * 0.85, 360),
        alignItems: 'center',
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        width: '120%',
        height: '120%',
        top: '-10%',
        left: '-10%',
        backgroundColor: '#22d3ee',
        opacity: 0.15,
        borderRadius: 40,
        transform: [{ scale: 1.1 }]
    },
    content: {
        width: '100%',
        backgroundColor: '#1e293b', // Slate 800
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)', // Cyan border
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    icon: {
        fontSize: 48,
        marginBottom: 20,
        textShadowColor: 'rgba(34, 211, 238, 0.5)',
        textShadowRadius: 10
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 3,
        textAlign: 'center',
        marginBottom: 15,
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: '#22d3ee',
        marginBottom: 20,
        opacity: 0.5
    },
    description: {
        color: '#e2e8f0',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: '500'
    },
    subDescription: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
    },
    actions: {
        width: '100%',
        alignItems: 'center',
    },
    restoreLink: {
        color: '#94a3b8',
        textDecorationLine: 'underline',
        fontSize: 14,
        marginBottom: 10
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
    },
    closeText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1
    }
})
