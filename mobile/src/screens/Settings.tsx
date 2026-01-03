import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, BackHandler } from 'react-native'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'

interface SettingsProps {
    onBack: () => void
}

export default function Settings({ onBack }: SettingsProps) {
    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack()
            return true
        })
        return () => backHandler.remove()
    }, [onBack])

    const resetGame = useGameStore(state => state.actions.resetGame)
    const settings = useGameStore(state => state.settings)
    const updateSettings = useGameStore(state => state.actions.updateSettings)

    const handleFullReset = () => {
        Alert.alert(
            "Erase All Progress?",
            "This will reset you to Level 1 and remove all stars. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Erase Everything",
                    style: "destructive",
                    onPress: () => {
                        resetGame()
                        onBack()
                    }
                }
            ]
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>SETTINGS</Text>
                <View style={styles.divider} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Audio Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>AUDIO</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Music</Text>
                        <TouchableOpacity
                            onPress={() => updateSettings({ masterVolume: settings.masterVolume > 0 ? 0.0 : 1.0 })}
                            style={[
                                styles.toggleBtn,
                                { backgroundColor: settings.masterVolume > 0 ? '#0891b2' : '#475569' }
                            ]}
                        >
                            <Text style={styles.toggleText}>{settings.masterVolume > 0 ? "ON" : "OFF"}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Sound FX</Text>
                        <TouchableOpacity
                            onPress={() => updateSettings({ sfxVolume: settings.sfxVolume > 0 ? 0.0 : 1.0 })}
                            style={[
                                styles.toggleBtn,
                                { backgroundColor: settings.sfxVolume > 0 ? '#0891b2' : '#475569' }
                            ]}
                        >
                            <Text style={styles.toggleText}>{settings.sfxVolume > 0 ? "ON" : "OFF"}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Vibration</Text>
                        <TouchableOpacity
                            onPress={() => updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
                            style={[
                                styles.toggleBtn,
                                { backgroundColor: settings.hapticsEnabled ? '#0891b2' : '#475569' }
                            ]}
                        >
                            <Text style={styles.toggleText}>{settings.hapticsEnabled ? "ON" : "OFF"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Speed Section */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>PLAYER SPEED</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Speed</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {[0.7, 1.0, 1.3].map((val) => (
                                <TouchableOpacity
                                    key={val}
                                    onPress={() => updateSettings({ speedModifier: val as any })}
                                    style={[
                                        styles.speedBtn,
                                        settings.speedModifier === val && styles.speedBtnActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.speedText,
                                        settings.speedModifier === val && styles.speedTextActive
                                    ]}>
                                        {val === 0.7 ? 'SLOW' : val === 1.0 ? 'NORMAL' : 'FAST'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={[styles.card, styles.dangerCard]}>
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>DANGER ZONE</Text>
                    <Button title="ERASE ALL DATA" onPress={handleFullReset} variant="destructive" />
                </View>

                <Button title="BACK" onPress={onBack} variant="secondary" style={{ marginTop: 10, marginBottom: 40 }} />
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
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.15)',
    },
    dangerCard: {
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    sectionTitle: {
        color: '#22d3ee',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        color: '#e2e8f0',
        fontSize: 15,
        fontWeight: '500',
    },
    toggleBtn: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    toggleText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 1
    },
    speedBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    speedBtnActive: {
        backgroundColor: '#22d3ee',
        borderColor: '#22d3ee',
    },
    speedText: {
        color: '#64748b',
        fontWeight: 'bold',
        fontSize: 11,
        letterSpacing: 1,
    },
    speedTextActive: {
        color: '#000',
    },
    // Stats styles
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    statNumber: {
        color: '#22d3ee',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    // About styles
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    aboutLabel: {
        color: '#64748b',
        fontSize: 14,
    },
    aboutValue: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '600',
    },
    credits: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 15,
        fontStyle: 'italic',
    }
})
