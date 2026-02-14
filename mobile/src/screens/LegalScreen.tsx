import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, BackHandler, TouchableOpacity } from 'react-native'
import { Button } from '../components/ui/Button'

interface LegalScreenProps {
    onBack: () => void
}

type LegalView = 'menu' | 'privacy' | 'terms'

export default function LegalScreen({ onBack }: LegalScreenProps) {
    const [currentView, setCurrentView] = useState<LegalView>('menu')

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (currentView !== 'menu') {
                setCurrentView('menu')
                return true
            }
            onBack()
            return true
        })
        return () => backHandler.remove()
    }, [onBack, currentView])

    const handleBack = () => {
        if (currentView !== 'menu') {
            setCurrentView('menu')
        } else {
            onBack()
        }
    }

    // Privacy Policy Content
    const PrivacyPolicyContent = () => (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.docTitle}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last updated: February 8, 2026</Text>

            <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>
                    <Text style={styles.bold}>Summary:</Text> Space Balls GO! is designed with your privacy in mind. We do not collect personal information. Game progress is stored locally on your device only.
                </Text>
            </View>

            <Text style={styles.sectionHead}>1. Information We Collect</Text>
            <Text style={styles.docText}><Text style={styles.bold}>We do NOT collect:</Text></Text>
            <Text style={styles.bulletItem}>• Personal information (name, email, phone number)</Text>
            <Text style={styles.bulletItem}>• Location data</Text>
            <Text style={styles.bulletItem}>• Device identifiers for tracking purposes</Text>
            <Text style={styles.bulletItem}>• Contacts or photos</Text>

            <Text style={[styles.docText, { marginTop: 12 }]}><Text style={styles.bold}>Data stored locally on your device:</Text></Text>
            <Text style={styles.bulletItem}>• Game progress (completed levels, stars earned)</Text>
            <Text style={styles.bulletItem}>• Settings preferences (sound, music, vibration)</Text>
            <Text style={styles.bulletItem}>• Purchase status (ads removed)</Text>
            <Text style={styles.docText}>This data never leaves your device and is not transmitted to our servers.</Text>

            <Text style={styles.sectionHead}>2. Third-Party Services</Text>
            <Text style={styles.docText}>Our app uses the following third-party services:</Text>

            <Text style={styles.subHead}>Google AdMob (Advertisements)</Text>
            <Text style={styles.docText}>We display ads through Google AdMob. Google may collect:</Text>
            <Text style={styles.bulletItem}>• Device advertising ID</Text>
            <Text style={styles.bulletItem}>• IP address</Text>
            <Text style={styles.bulletItem}>• General device information</Text>

            <Text style={styles.subHead}>Google Play Services</Text>
            <Text style={styles.docText}>For in-app purchases, we use Google Play Billing. Purchase transactions are handled entirely by Google.</Text>

            <Text style={styles.sectionHead}>3. Children's Privacy</Text>
            <Text style={styles.docText}>Space Balls GO! is suitable for all ages. We do not knowingly collect personal information from children under 13. The app does not require account creation or personal data submission.</Text>

            <Text style={styles.sectionHead}>4. Data Retention</Text>
            <Text style={styles.docText}>Since we don't collect personal data, there is no data to retain on our servers. Your game progress is stored locally and can be deleted by:</Text>
            <Text style={styles.bulletItem}>• Using the "Erase All Data" option in Settings</Text>
            <Text style={styles.bulletItem}>• Clearing app data in your device settings</Text>
            <Text style={styles.bulletItem}>• Uninstalling the app</Text>

            <Text style={styles.sectionHead}>5. Your Rights</Text>
            <Text style={styles.docText}>You have the right to:</Text>
            <Text style={styles.bulletItem}>• Delete your local game data at any time</Text>
            <Text style={styles.bulletItem}>• Opt out of personalized ads via device settings</Text>
            <Text style={styles.bulletItem}>• Remove ads via in-app purchase</Text>
            <Text style={styles.bulletItem}>• Contact us with privacy concerns</Text>

            <Text style={styles.sectionHead}>6. Contact Us</Text>
            <Text style={styles.docText}>If you have questions about this Privacy Policy:</Text>
            <Text style={styles.contactEmail}>hassiumlaboratory@gmail.com</Text>

            <Text style={styles.copyright}>© 2026 Hassium Labs. All rights reserved.</Text>

            <Button title="BACK" onPress={handleBack} variant="secondary" style={{ marginTop: 20, marginBottom: 40 }} />
        </ScrollView>
    )

    // Terms of Service Content
    const TermsOfServiceContent = () => (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.docTitle}>Terms of Service</Text>
            <Text style={styles.lastUpdated}>Last updated: February 8, 2026</Text>

            <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>
                    By downloading, installing, or using Space Balls GO!, you agree to these Terms of Service.
                </Text>
            </View>

            <Text style={styles.sectionHead}>1. Acceptance of Terms</Text>
            <Text style={styles.docText}>By accessing or using Space Balls GO! ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</Text>

            <Text style={styles.sectionHead}>2. License to Use</Text>
            <Text style={styles.docText}>Hassium Labs grants you a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes on devices you own or control.</Text>

            <Text style={styles.sectionHead}>3. User Responsibilities</Text>
            <Text style={styles.docText}>You agree to:</Text>
            <Text style={styles.bulletItem}>• Use the App only for lawful purposes</Text>
            <Text style={styles.bulletItem}>• Not attempt to reverse engineer, modify, or distribute the App</Text>
            <Text style={styles.bulletItem}>• Not use the App in any way that could damage our services</Text>
            <Text style={styles.bulletItem}>• Not attempt to gain unauthorized access to any portion of the App</Text>

            <Text style={styles.sectionHead}>4. In-App Purchases</Text>
            <Text style={styles.docText}>The App may offer in-app purchases (such as "Remove Ads"). All purchases are:</Text>
            <Text style={styles.bulletItem}>• Final and non-refundable unless required by applicable law</Text>
            <Text style={styles.bulletItem}>• Processed through Google Play Store</Text>
            <Text style={styles.bulletItem}>• Subject to Google Play's Terms of Service</Text>
            <Text style={styles.docText}>For refund requests, please contact Google Play Support or email us.</Text>

            <Text style={styles.sectionHead}>5. Advertisements</Text>
            <Text style={styles.docText}>The App displays advertisements through Google AdMob. Ad content is provided by third parties and Hassium Labs is not responsible for third-party ad content.</Text>

            <Text style={styles.sectionHead}>6. Intellectual Property</Text>
            <Text style={styles.docText}>All content in the App, including graphics, music, gameplay mechanics, and code, is owned by Hassium Labs and protected by intellectual property laws. You may not copy, modify, or distribute any part of the App without written permission.</Text>

            <Text style={styles.sectionHead}>7. Disclaimer of Warranties</Text>
            <Text style={styles.docText}>The App is provided "AS IS" without warranties of any kind. Hassium Labs does not guarantee that the App will be error-free, secure, or available at all times.</Text>

            <Text style={styles.sectionHead}>8. Limitation of Liability</Text>
            <Text style={styles.docText}>To the maximum extent permitted by law, Hassium Labs shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.</Text>

            <Text style={styles.sectionHead}>9. Changes to Terms</Text>
            <Text style={styles.docText}>We may update these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms.</Text>

            <Text style={styles.sectionHead}>10. Contact Us</Text>
            <Text style={styles.docText}>If you have questions about these Terms:</Text>
            <Text style={styles.contactEmail}>hassiumlaboratory@gmail.com</Text>

            <Text style={styles.copyright}>© 2026 Hassium Labs. All rights reserved.</Text>

            <Button title="BACK" onPress={handleBack} variant="secondary" style={{ marginTop: 20, marginBottom: 40 }} />
        </ScrollView>
    )

    // Menu View
    const MenuContent = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Privacy Policy Card */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => setCurrentView('privacy')}
                activeOpacity={0.7}
            >
                <View style={styles.cardIcon}>
                    <Text style={styles.iconText}>🔒</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Privacy Policy</Text>
                    <Text style={styles.cardDesc}>How we handle your data and protect your privacy</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>

            {/* Terms of Service Card */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => setCurrentView('terms')}
                activeOpacity={0.7}
            >
                <View style={styles.cardIcon}>
                    <Text style={styles.iconText}>📋</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Terms of Service</Text>
                    <Text style={styles.cardDesc}>Rules and conditions for using the app</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    Space Balls GO! respects your privacy. We don't collect personal data - your game progress is stored locally on your device only.
                </Text>
            </View>

            <Button
                title="BACK"
                onPress={onBack}
                variant="secondary"
                style={{ marginTop: 10, marginBottom: 40 }}
            />
        </ScrollView>
    )

    const getTitle = () => {
        switch (currentView) {
            case 'privacy': return 'PRIVACY POLICY'
            case 'terms': return 'TERMS OF SERVICE'
            default: return 'LEGAL'
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{getTitle()}</Text>
                <View style={styles.divider} />
            </View>

            {currentView === 'menu' && <MenuContent />}
            {currentView === 'privacy' && <PrivacyPolicyContent />}
            {currentView === 'terms' && <TermsOfServiceContent />}
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
        fontSize: 24,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 3,
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
    contentScroll: {
        flex: 1,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.15)',
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    iconText: {
        fontSize: 20,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 3,
    },
    cardDesc: {
        color: '#64748b',
        fontSize: 12,
    },
    arrow: {
        color: '#22d3ee',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
    },
    infoText: {
        color: '#94a3b8',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
    },
    // Document styles
    docTitle: {
        color: '#22d3ee',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    lastUpdated: {
        color: '#64748b',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
    },
    highlightBox: {
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
    },
    highlightText: {
        color: '#e2e8f0',
        fontSize: 14,
        lineHeight: 22,
    },
    sectionHead: {
        color: '#22d3ee',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    subHead: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 6,
    },
    docText: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
    bold: {
        fontWeight: 'bold',
        color: '#e2e8f0',
    },
    bulletItem: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 24,
        marginLeft: 10,
    },
    contactEmail: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    copyright: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 30,
    },
})
