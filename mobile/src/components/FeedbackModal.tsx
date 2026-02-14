import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native'

interface FeedbackModalProps {
    visible: boolean
    onClose: () => void
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.hassiumlabs.spaceballs'

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
    const handleRateApp = () => {
        Linking.openURL(PLAY_STORE_URL).catch(err =>
            console.warn('Failed to open Play Store:', err)
        )
        onClose()
    }

    const handleFeedback = () => {
        Linking.openURL('mailto:hassiumlabs@gmail.com?subject=Space%20Balls%20GO!%20Feedback').catch(err =>
            console.warn('Failed to open email:', err)
        )
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <Text style={styles.emoji}>⭐</Text>
                    <Text style={styles.title}>Enjoying the Game?</Text>
                    <Text style={styles.subtitle}>
                        Your feedback helps us improve Space Balls GO!
                    </Text>

                    {/* Buttons */}
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleRateApp}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryBtnText}>⭐ Rate on Play Store</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={handleFeedback}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryBtnText}>✉️ Send Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dismissBtn}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.dismissBtnText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modal: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
    },
    emoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    title: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    primaryBtn: {
        backgroundColor: '#22d3ee',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    primaryBtnText: {
        color: '#0a0f1a',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    secondaryBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryBtnText: {
        color: '#e2e8f0',
        fontSize: 15,
        fontWeight: '600',
    },
    dismissBtn: {
        paddingVertical: 10,
        marginTop: 5,
    },
    dismissBtnText: {
        color: '#64748b',
        fontSize: 13,
    },
})
