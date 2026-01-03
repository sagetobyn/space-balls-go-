import React, { useEffect, useRef, useMemo } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Easing, ScrollView, BackHandler } from 'react-native'
import { useGameStore } from './store/gameStore'
import { LevelSequenceV2 } from './rules/LevelSequence'
import { Button } from './components/ui/Button'


const { width: SCREEN_WIDTH } = Dimensions.get('window')
const NODE_SIZE = 60
const NODE_RADIUS = NODE_SIZE / 2
const GRID_COLS = 3

// --- Components ---

// 1. Star Rating
const StarRating = ({ count, locked }: { count: number, locked: boolean }) => {
    if (locked) return null
    return (
        <View style={styles.starContainer}>
            {[1, 2, 3].map((i) => (
                <Text key={i} style={[styles.star, { color: i <= count ? '#fbbf24' : '#334155' }]}>
                    ★
                </Text>
            ))}
        </View>
    )
}

// 2. Connector Line
const ConstellationLine = ({ start, end, active }: { start: { x: number, y: number }, end: { x: number, y: number }, active: boolean }) => {
    const cx = (start.x + end.x) / 2
    const cy = (start.y + end.y) / 2
    const len = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI

    return (
        <View style={{
            position: 'absolute',
            left: cx - len / 2,
            top: cy - 1,
            width: len,
            height: active ? 2 : 1,
            backgroundColor: active ? '#22d3ee' : '#334155',
            transform: [{ rotate: `${angle}deg` }],
            shadowColor: '#22d3ee',
            shadowOpacity: active ? 0.6 : 0,
            shadowRadius: 8,
            opacity: active ? 0.8 : 0.3
        }} />
    )
}

// 3. Level Node
const LevelNode = ({ x, y, level, status, stars, onPress, delay }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
            delay: delay
        }).start()

        if (status === 'current') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
                ])
            ).start()
        }
    }, [])

    const isLocked = status === 'locked'
    const isCurrent = status === 'current'
    const isPassed = status === 'passed'

    const bgColor = isLocked ? '#0f172a' : isCurrent ? '#0891b2' : '#1e293b'
    const borderColor = isLocked ? '#1e293b' : isCurrent ? '#67e8f9' : '#22d3ee'
    const borderWidth = isCurrent ? 2 : 1

    return (
        <Animated.View style={{
            position: 'absolute',
            left: x - NODE_RADIUS,
            top: y - NODE_RADIUS,
            transform: [{ scale: scaleAnim }]
        }}>
            {isCurrent && (
                <Animated.View style={{
                    position: 'absolute',
                    width: NODE_SIZE * 1.6,
                    height: NODE_SIZE * 1.6,
                    borderRadius: NODE_SIZE,
                    backgroundColor: '#22d3ee',
                    opacity: 0.15,
                    transform: [{ scale: pulseAnim }],
                    left: -NODE_SIZE * 0.3,
                    top: -NODE_SIZE * 0.3,
                }} />
            )}

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                disabled={isLocked}
                style={[
                    styles.node,
                    { backgroundColor: bgColor, borderColor: borderColor, borderWidth: borderWidth },
                    isCurrent && styles.nodeCurrentGlow,
                    isPassed && styles.nodePassedGlow
                ]}
            >
                {isLocked ? (
                    <Text style={styles.lockIcon}>🔒</Text>
                ) : (
                    <Text style={[styles.nodeText, isCurrent && { color: 'white' }]}>{level}</Text>
                )}
            </TouchableOpacity>

            <View style={{ position: 'absolute', bottom: -20, width: 60, left: 0, alignItems: 'center' }}>
                <StarRating count={stars} locked={isLocked} />
            </View>
        </Animated.View>
    )
}

export default function HomeScreen({ onLevelSelect, onBack }: { onLevelSelect: (l: number) => void, onBack: () => void }) {
    const currentLevel = useGameStore(state => state.currentLevel)
    const levelProgress = useGameStore(state => state.levelProgress)

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack()
            return true
        })
        return () => backHandler.remove()
    }, [onBack])

    // Calculate stats
    const totalLevels = LevelSequenceV2.length
    const completedLevels = Object.values(levelProgress).filter(l => l.completed).length
    const totalStars = Object.values(levelProgress).reduce((sum, l) => sum + (l.stars || 0), 0)
    const maxStars = totalLevels * 3

    // ScrollView ref for auto-scrolling to current level
    const scrollViewRef = useRef<ScrollView>(null)

    // Background Orbs
    const orb1 = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb1, { toValue: 1, duration: 10000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orb1, { toValue: 0, duration: 10000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
            ])
        ).start()
    }, [])
    const orbScale = orb1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] })

    // Generate Layout
    const nodes = useMemo(() => {
        const items = []
        const ROW_H = 120
        const PADDING_TOP = 280
        const PADDING_BOTTOM = 100

        for (let i = 0; i < LevelSequenceV2.length; i++) {
            const row = Math.floor(i / GRID_COLS)
            const col = i % GRID_COLS
            const isEvenRow = row % 2 === 0
            const displayCol = isEvenRow ? col : (GRID_COLS - 1 - col)
            const colWidth = (SCREEN_WIDTH - 40) / GRID_COLS
            const cx = 20 + colWidth * displayCol + colWidth / 2
            const cy = PADDING_TOP + row * ROW_H + (col % 2 === 0 ? 0 : 30)

            items.push({
                level: i + 1,
                x: cx,
                y: cy,
                stars: levelProgress[i + 1]?.stars || 0
            })
        }
        return items
    }, [levelProgress])

    // Auto-scroll to current level on mount
    useEffect(() => {
        if (scrollViewRef.current && nodes.length > 0) {
            const currentNode = nodes.find(n => n.level === currentLevel)
            if (currentNode) {
                // Delay slightly to ensure layout is complete
                setTimeout(() => {
                    const { height: screenHeight } = Dimensions.get('window')
                    // Scroll so current level is centered on screen
                    const targetY = Math.max(0, currentNode.y - screenHeight / 2 + 50)
                    scrollViewRef.current?.scrollTo({ y: targetY, animated: true })
                }, 300)
            }
        }
    }, [currentLevel, nodes])

    return (
        <View style={styles.container}>
            {/* Background */}
            <View style={styles.bg}>
                <View style={{ position: 'absolute', top: 0, width: '100%', height: '100%', backgroundColor: '#020617' }} />
                <Animated.View style={[styles.orb, {
                    width: 500, height: 500, backgroundColor: '#22d3ee', opacity: 0.12, top: -100, right: -100,
                    transform: [{ scale: orbScale }]
                }]} />
                <Animated.View style={[styles.orb, {
                    width: 400, height: 400, backgroundColor: '#ec4899', opacity: 0.1, bottom: -50, left: -150,
                    transform: [{ scale: orbScale }]
                }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>SELECT LEVEL</Text>
                            <View style={styles.divider} />
                        </View>
                        <Button title="✕" onPress={onBack} variant="ghost" size="sm" />
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{completedLevels}/{totalLevels}</Text>
                            <Text style={styles.statLabel}>COMPLETED</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.statValue}>{totalStars}</Text>
                                <Text style={[styles.star, { fontSize: 14, marginLeft: 3 }]}>★</Text>
                            </View>
                            <Text style={styles.statLabel}>STARS EARNED</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 100, minHeight: nodes[nodes.length - 1].y + 150 }}>
                {/* Connectors */}
                {nodes.map((node, i) => {
                    if (i === nodes.length - 1) return null
                    const next = nodes[i + 1]
                    return <ConstellationLine key={`line-${i}`} start={node} end={next} active={true} />
                })}

                {/* Nodes */}
                {nodes.map((node, i) => {
                    let status = 'locked'
                    const isCompleted = levelProgress[node.level]?.completed
                    const prevCompleted = node.level === 1 || levelProgress[node.level - 1]?.completed

                    // Highlight the current level from store as 'current' (most recently played)
                    if (node.level === currentLevel) {
                        status = 'current'
                    } else if (isCompleted) {
                        status = 'passed'
                    } else if (prevCompleted) {
                        // Next playable level (not the one just played)
                        status = 'passed' // Show as accessible but not highlighted
                    }

                    return (
                        <LevelNode
                            key={`node-${i}`}
                            {...node}
                            status={status}
                            onPress={() => onLevelSelect(node.level)}
                            delay={i * 25}
                        />
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingHorizontal: 15,
        zIndex: 20,
    },
    headerCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(236, 72, 153, 0.3)',
        shadowColor: '#ec4899',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 3
    },
    divider: {
        width: 50,
        height: 2,
        backgroundColor: '#22d3ee',
        marginTop: 8,
        opacity: 0.5
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        padding: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 15,
    },
    statValue: {
        color: '#ec4899',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(236, 72, 153, 0.5)',
        textShadowRadius: 10,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 2,
    },
    node: {
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
    },
    nodeCurrentGlow: {
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10
    },
    nodePassedGlow: {
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5
    },
    nodeText: {
        color: '#94A3B8',
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'monospace'
    },
    lockIcon: {
        fontSize: 16,
        opacity: 0.5
    },
    starContainer: {
        flexDirection: 'row',
        gap: 2
    },
    star: {
        fontSize: 10,
        color: '#fbbf24',
        textShadowColor: 'rgba(251, 191, 36, 0.3)',
        textShadowRadius: 4
    }
})
