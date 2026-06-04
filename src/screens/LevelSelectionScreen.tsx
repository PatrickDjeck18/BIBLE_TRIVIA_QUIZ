import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LevelNode } from '../components/LevelNode';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import { levels } from '../data/questions';
import { ArrowLeft, Trophy, BookOpen } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useAds } from '../context/AdContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Testament boundaries (first level index of each section)
const TESTAMENT_SECTIONS = [
    { label: 'Old Testament', startIndex: 0, endIndex: 38 },
    { label: 'New Testament', startIndex: 39, endIndex: 65 },
];

function getSectionLabel(index: number): string | null {
    for (const s of TESTAMENT_SECTIONS) {
        if (index === s.startIndex) return s.label;
    }
    return null;
}

export default function LevelSelectionScreen() {
    const router = useRouter();
    const { state, getLevelProgress, isLevelUnlocked } = useGame();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();

    const nodeWrapperWidth = Math.min(310, screenWidth * 0.82);

    const getLevelStatus = (levelId: string): 'completed' | 'current' | 'locked' => {
        const progress = getLevelProgress(levelId);
        if (progress?.completed) return 'completed';
        if (isLevelUnlocked(levelId)) return 'current';
        return 'locked';
    };

    const handleBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
    };

    const completedCount = Object.values(state.levelsProgress).filter(l => l.completed).length;
    const totalLevels = levels.length;
    const progressPct = Math.min(100, (completedCount / totalLevels) * 100);

    return (
        <AnimatedBackground variant="levels">
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* ── Header ── */}
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backBtn}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <ArrowLeft color={colors.card.text} size={24} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Biblical Journey</Text>
                        <Text style={styles.headerSub}>{completedCount} / {totalLevels} books</Text>
                    </View>

                    <View style={styles.trophyBadge}>
                        <Trophy color={colors.gold} size={18} fill={colors.gold} />
                        <Text style={styles.trophyText}>{completedCount}</Text>
                    </View>
                </Animated.View>

                {/* ── Progress bar ── */}
                <Animated.View entering={FadeIn.delay(200)} style={styles.progressContainer}>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                    </View>
                </Animated.View>

                {/* ── Level path ── */}
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {levels.map((level, index) => {
                        const status = getLevelStatus(level.id);
                        const alignLeft = index % 2 === 0;
                        const progress = getLevelProgress(level.id);
                        const sectionLabel = getSectionLabel(index);

                        return (
                            <React.Fragment key={level.id}>
                                {/* Section header */}
                                {sectionLabel && (
                                    <Animated.View
                                        entering={FadeInDown.delay(index * 30).springify()}
                                        style={styles.sectionHeader}
                                    >
                                        <BookOpen color={colors.gold} size={16} />
                                        <Text style={styles.sectionLabel}>{sectionLabel}</Text>
                                        <View style={styles.sectionLine} />
                                    </Animated.View>
                                )}

                                <View style={[styles.levelRow, { width: screenWidth }]}>
                                    {/* Vertical connector */}
                                    {index < levels.length - 1 && (
                                        <View style={[
                                            styles.connector,
                                            status === 'completed' && styles.connectorDone
                                        ]} />
                                    )}

                                    {/* Node */}
                                    <View style={[
                                        { width: nodeWrapperWidth, alignItems: 'center' },
                                        alignLeft ? { alignItems: 'flex-end', paddingRight: 24 } : { alignItems: 'flex-start', paddingLeft: 24 }
                                    ]}>
                                        <LevelNode
                                            levelNumber={index + 1}
                                            title={level.title}
                                            status={status}
                                            stars={progress?.stars || 0}
                                            delay={Math.min(index * 40, 600)}
                                            onPress={() => {
                                                if (status !== 'locked') {
                                                    router.push({ pathname: '/quiz', params: { levelId: level.id } });
                                                }
                                            }}
                                            color={level.color}
                                        />
                                    </View>
                                </View>
                            </React.Fragment>
                        );
                    })}
                </ScrollView>
            </View>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 12,
    },
    backBtn: { padding: 8 },
    headerCenter: { flex: 1 },
    headerTitle: {
        color: colors.card.text,
        fontSize: typography.fontSize.h2,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.tight,
    },
    headerSub: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.medium,
        letterSpacing: typography.letterSpacing.wide,
        marginTop: 2,
    },
    trophyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.goldDim,
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.35)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    trophyText: {
        color: colors.gold,
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },

    // Progress bar
    progressContainer: { paddingHorizontal: 20, marginBottom: 8 },
    progressBg: {
        height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
    },
    progressFill: {
        height: '100%', borderRadius: 2,
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },

    // Scroll
    scrollContent: { paddingBottom: 100, paddingTop: 16, alignItems: 'center' },

    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionLabel: {
        color: colors.gold,
        fontSize: 11,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(245,158,11,0.20)',
    },

    // Level rows
    levelRow: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -18,
    },
    connector: {
        position: 'absolute',
        width: 4,
        height: 140,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: 40,
        borderRadius: 2,
        zIndex: -1,
    },
    connectorDone: {
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    nodeWrapper: { width: 310, alignItems: 'center' },
    alignLeft: { alignItems: 'flex-start', paddingLeft: 24 },
    alignRight: { alignItems: 'flex-end', paddingRight: 24 },
});
