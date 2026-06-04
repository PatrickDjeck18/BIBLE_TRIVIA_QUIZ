import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../src/components/GlassContainer';
import { GlassButton } from '../src/components/GlassButton';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { useRouter } from 'expo-router';
import { useGame } from '../src/context/GameContext';
import {
    Trophy, Flame, Gift, Star, BookOpen,
    Zap, Target, ChevronRight
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useScreenInsets } from '../src/hooks/useScreenInsets';
import { Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

// ──────────────────────────────────────────────────────────────
// Daily Verse data (static rotation)
// ──────────────────────────────────────────────────────────────
const DAILY_VERSES = [
    { text: "Your word is a lamp to my feet and a light to my path.", ref: "Psalms 119:105" },
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
    { text: "For God so loved the world that He gave His only begotten Son.", ref: "John 3:16" },
    { text: "The LORD is my shepherd; I shall not want.", ref: "Psalms 23:1" },
    { text: "Seek first the kingdom of God and His righteousness.", ref: "Matthew 6:33" },
    { text: "Trust in the LORD with all your heart.", ref: "Proverbs 3:5" },
    { text: "Be strong and courageous! Do not be afraid!", ref: "Joshua 1:9" },
];

const VERSE_INDEX = new Date().getDate() % DAILY_VERSES.length;

// ──────────────────────────────────────────────────────────────
// Splash Screen
// ──────────────────────────────────────────────────────────────
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={splashStyles.container}>
            <LinearGradient
                colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative rings */}
            <View style={[splashStyles.ring, splashStyles.ring1]} />
            <View style={[splashStyles.ring, splashStyles.ring2]} />

            {/* Logo */}
            <View style={splashStyles.logoArea}>
                <View style={splashStyles.iconBg}>
                    <BookOpen color={colors.accent} size={56} strokeWidth={1.5} />
                </View>
                <Text style={splashStyles.title}>
                    Bible Quiz
                </Text>
                <Text style={splashStyles.tagline}>
                    Test your faith 🕊️
                </Text>
            </View>

            {/* Progress */}
            <View style={splashStyles.progressArea}>
                <View style={splashStyles.progressBg}>
                    <View style={[splashStyles.progressFill, { width: '100%' }]} />
                </View>
                <Text style={splashStyles.progressLabel}>Loading...</Text>
            </View>
        </View>
    );
};

const splashStyles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    ring: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(92,179,56,0.15)',
        borderRadius: 9999,
    },
    ring1: { width: 340, height: 340, borderColor: 'rgba(92,179,56,0.18)' },
    ring2: { width: 500, height: 500, borderColor: 'rgba(245,158,11,0.08)' },
    logoArea: { alignItems: 'center', gap: 12 },
    iconBg: {
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: 'rgba(92,179,56,0.12)',
        borderWidth: 1, borderColor: 'rgba(92,179,56,0.3)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    title: {
        fontSize: 38, fontFamily: typography.fontFamily.bold,
        color: colors.card.text, letterSpacing: typography.letterSpacing.tight,
    },
    tagline: {
        fontSize: 16, color: colors.card.textSecondary,
        fontFamily: typography.fontFamily.regular,
        letterSpacing: typography.letterSpacing.wide,
    },
    progressArea: { position: 'absolute', bottom: 80, alignItems: 'center', gap: 12 },
    progressBg: {
        width: 220, height: 4, borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
    },
    progressFill: {
        height: '100%', borderRadius: 2,
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    progressLabel: {
        color: colors.card.textMuted, fontSize: 13,
        fontFamily: typography.fontFamily.regular,
        letterSpacing: typography.letterSpacing.wider,
    },
});

// ──────────────────────────────────────────────────────────────
// Floating Icon
// ──────────────────────────────────────────────────────────────
const FloatingIcon = ({ children }: { children: React.ReactNode }) => {
    return <View>{children}</View>;
};

// ──────────────────────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────────────────────
const StatCard = ({
    icon, value, label, glowColor, compact
}: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    glowColor: string;
    compact?: boolean;
}) => (
    <View style={[statStyles.card]}>
        <View style={[
            statStyles.iconWrap,
            compact && statStyles.iconWrapCompact,
            { shadowColor: glowColor, backgroundColor: `${glowColor}22`, borderColor: `${glowColor}44` },
        ]}>
            <FloatingIcon>
                {icon}
            </FloatingIcon>
        </View>
        <Text style={[statStyles.value, compact && statStyles.valueCompact, { color: glowColor }]} numberOfLines={1}>
            {value}
        </Text>
        <Text style={[statStyles.label, compact && statStyles.labelCompact]} numberOfLines={1}>
            {label}
        </Text>
    </View>
);

const statStyles = StyleSheet.create({
    card: {
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 0,
    },
    iconWrap: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    iconWrapCompact: {
        width: 44, height: 44, borderRadius: 22,
    },
    value: {
        fontSize: 22,
        fontFamily: typography.fontFamily.bold,
    },
    valueCompact: {
        fontSize: 18,
    },
    label: {
        fontSize: 11,
        color: colors.card.textSecondary,
        fontFamily: typography.fontFamily.regular,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
    },
    labelCompact: {
        fontSize: 9,
        letterSpacing: 0.3,
    },
});

// ──────────────────────────────────────────────────────────────
// Home Screen
// ──────────────────────────────────────────────────────────────
export default function Home() {
    const router = useRouter();
    const { state, claimDailyReward, setPlayerName } = useGame();
    const [showReward, setShowReward] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    const [tempName, setTempName] = useState('');
    const { top, contentBottom } = useScreenInsets();
    const { width } = useWindowDimensions();

    const isSmall = width < 375;
    const isNarrow = width < 400;
    const containerPadding = isSmall ? 14 : 22;

    const handleDailyReward = () => {
        const result = claimDailyReward();
        if (result.claimed) {
            setRewardAmount(result.points + result.streakBonus);
            setShowReward(true);
            setTimeout(() => setShowReward(false), 3000);
        }
    };

    const completedLevels = Object.values(state.levelsProgress).filter(l => l.completed).length;
    const accuracy = state.totalQuestionsAnswered > 0
        ? Math.round((state.totalCorrectAnswers / state.totalQuestionsAnswered) * 100)
        : 0;

    const verse = DAILY_VERSES[VERSE_INDEX];

    if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

    return (
        <AnimatedBackground variant="home">
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: top + 16, paddingBottom: contentBottom + 16, paddingHorizontal: containerPadding }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Header ── */}
                <View style={styles.headerRow}>
                    <View style={styles.headerTextCol}>
                        <Text style={styles.headerGreeting}>Welcome 👋</Text>
                        <Text style={[styles.headerTitle, isSmall && styles.headerTitleSmall]} numberOfLines={1}>
                            {state.playerName || 'Player'}
                        </Text>
                    </View>
                    <FloatingIcon>
                        <BookOpen color={colors.accent} size={32} />
                    </FloatingIcon>
                </View>

                {/* ── Daily Challenge Banner ── */}
                {!state.dailyChallengeCompleted && (
                    <View style={styles.rewardBanner}>
                        <LinearGradient
                            colors={['rgba(92,179,56,0.18)', 'rgba(92,179,56,0.06)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.rewardGradient}
                        >
                            <View style={styles.rewardInner}>
                                <View style={styles.rewardTextContainer}>
                                    <View>
                                        <Trophy color={colors.accent} size={22} />
                                    </View>
                                    <View style={styles.rewardCopy}>
                                        <Text style={[styles.rewardText, { color: colors.accent }]} numberOfLines={1}>
                                            Daily Challenge
                                        </Text>
                                        <Text style={styles.rewardSubtext} numberOfLines={1}>5 Qs • Double Points</Text>
                                    </View>
                                </View>
                                <GlassButton
                                    title="Play"
                                    onPress={() => router.push('/quiz?levelId=daily')}
                                    variant="success"
                                    style={styles.claimBtn}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* ── Daily Reward Banner ── */}
                {!state.dailyRewardClaimed && (
                    <View style={styles.rewardBanner}>
                        <LinearGradient
                            colors={['rgba(245,158,11,0.18)', 'rgba(245,158,11,0.06)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.rewardGradient}
                        >
                            <View style={styles.rewardInner}>
                                <View style={styles.rewardTextContainer}>
                                    <View>
                                        <Gift color={colors.gold} size={22} />
                                    </View>
                                    <Text style={[styles.rewardText, { flex: 1 }]} numberOfLines={2}>Daily reward available!</Text>
                                </View>
                                <GlassButton
                                    title="Claim"
                                    onPress={handleDailyReward}
                                    variant="primary"
                                    style={styles.claimBtn}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* ── Stats Row ── */}
                <View style={[styles.statsRow, isNarrow && styles.statsRowNarrow]}>
                    <StatCard icon={<Trophy color={colors.gold} size={22} />} value={state.totalPoints} label="Points" glowColor={colors.gold} compact={isNarrow} />
                    <View style={styles.statDivider} />
                    <StatCard icon={<Flame color={colors.warning} size={22} />} value={state.currentStreak} label="Streak" glowColor={colors.warning} compact={isNarrow} />
                    <View style={styles.statDivider} />
                    <StatCard icon={<Target color={colors.accent} size={22} />} value={`${accuracy}%`} label="Accuracy" glowColor={colors.accent} compact={isNarrow} />
                    <View style={styles.statDivider} />
                    <StatCard icon={<Star color="#A78BFA" size={22} />} value={completedLevels} label="Levels" glowColor="#A78BFA" compact={isNarrow} />
                </View>

                {/* ── Verset du Jour ── */}
                <View>
                    <GlassContainer variant="gold" gradient style={styles.verseCard}>
                        <View style={styles.verseHeader}>
                            <Zap color={colors.gold} size={16} fill={colors.gold} />
                            <Text style={styles.verseHeaderText}>Verse of the Day</Text>
                        </View>
                        <Text style={styles.verseText}>"{verse.text}"</Text>
                        <Text style={styles.verseRef}>— {verse.ref}</Text>
                    </GlassContainer>
                </View>

                {/* ── Action Buttons ── */}
                <View style={styles.buttons}>
                    <GlassButton
                        title="Start Quiz"
                        onPress={() => router.push('/levels')}
                        variant="primary"
                        icon={<ChevronRight color="#000" size={18} />}
                        style={styles.mainBtn}
                    />
                    <GlassButton
                        title="Settings"
                        onPress={() => router.push('/settings')}
                        variant="secondary"
                        style={styles.mainBtn}
                    />
                </View>

                {/* ── Progress Footer ── */}
                <View style={styles.progressFooter}>
                    <Text style={styles.progressFooterLabel}>Global Progress</Text>
                    <Text style={styles.progressFooterValue}>{completedLevels} books completed</Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[styles.progressBarFill, {
                                width: `${Math.min(100, (completedLevels / 66) * 100)}%`
                            }]}
                        />
                    </View>
                </View>

            </ScrollView>

            {/* ── Reward Popup ── */}
            {showReward && (
                <View style={styles.rewardPopup}>
                    <GlassContainer variant="gold" style={styles.rewardPopupCard}>
                        <View>
                            <Star color={colors.gold} size={48} fill={colors.gold} />
                        </View>
                        <Text style={styles.rewardAmount}>
                            +{rewardAmount}
                        </Text>
                        <Text style={styles.rewardAmountLabel}>points earned!</Text>
                    </GlassContainer>
                </View>
            )}

            {/* ── Player Name Prompt ── */}
            <Modal
                visible={!showSplash && !state.playerName}
                transparent
                animationType="fade"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <GlassContainer variant="elevated" gradient style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Welcome to Bible Quiz</Text>
                        <Text style={styles.modalSub}>Please enter your name to continue:</Text>
                        
                        <TextInput
                            style={styles.nameInput}
                            value={tempName}
                            onChangeText={setTempName}
                            placeholder="Your Name"
                            placeholderTextColor={colors.card.textMuted}
                            autoFocus
                            maxLength={15}
                        />

                        <GlassButton
                            title="Continue"
                            variant="primary"
                            disabled={!tempName.trim()}
                            onPress={() => setPlayerName(tempName.trim())}
                            style={{ marginTop: 10 }}
                        />
                    </GlassContainer>
                </KeyboardAvoidingView>
            </Modal>

        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        gap: 20,
        flexGrow: 1,
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    headerTextCol: {
        flex: 1,
        minWidth: 0,
    },
    headerGreeting: {
        fontSize: typography.fontSize.bodySmall,
        color: colors.card.textSecondary,
        fontFamily: typography.fontFamily.regular,
        letterSpacing: typography.letterSpacing.wide,
    },
    headerTitle: {
        fontSize: typography.fontSize.h1,
        fontFamily: typography.fontFamily.bold,
        color: colors.card.text,
        letterSpacing: typography.letterSpacing.tight,
        flexShrink: 1,
    },
    headerTitleSmall: {
        fontSize: typography.fontSize.h2,
    },

    // Daily reward banner
    rewardBanner: { borderRadius: 16, overflow: 'hidden' },
    rewardGradient: {
        borderWidth: 1, borderColor: colors.card.borderGold,
        borderRadius: 16, padding: 14,
    },
    rewardInner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    },
    rewardTextContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0,
    },
    rewardCopy: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    rewardSubtext: {
        color: colors.card.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.regular,
    },
    rewardText: {
        color: colors.gold,
        fontSize: typography.fontSize.bodySmall,
        fontFamily: typography.fontFamily.medium,
        minWidth: 0,
    },
    claimBtn: { paddingVertical: 8, paddingHorizontal: 16, flexShrink: 0 },

    // Stats
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.card.border,
        paddingVertical: 18,
        paddingHorizontal: 10,
    },
    statsRowNarrow: {
        paddingVertical: 14,
        paddingHorizontal: 6,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 2,
    },

    // Verse card
    verseCard: { gap: 10 },
    verseHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    verseHeaderText: {
        color: colors.gold, fontSize: 11,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
    },
    verseText: {
        color: colors.card.text,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.regular,
        fontStyle: 'italic',
        lineHeight: 26,
    },
    verseRef: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.medium,
        textAlign: 'right',
    },

    // Buttons
    buttons: { gap: 12 },
    mainBtn: { width: '100%' },

    // Progress footer
    progressFooter: { gap: 8, paddingBottom: 10 },
    progressFooterLabel: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.medium,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
    },
    progressFooterValue: {
        color: colors.card.text,
        fontSize: typography.fontSize.bodySmall,
        fontFamily: typography.fontFamily.bold,
    },
    progressBarBg: {
        height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%', borderRadius: 3,
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },

    // Reward popup
    rewardPopup: {
        position: 'absolute',
        top: '28%',
        alignSelf: 'center',
        zIndex: 999,
    },
    rewardPopupCard: {
        alignItems: 'center',
        padding: 30,
        gap: 8,
        minWidth: 200,
    },
    rewardAmount: {
        fontSize: 40,
        fontFamily: typography.fontFamily.bold,
        color: colors.gold,
    },
    rewardAmountLabel: {
        fontSize: typography.fontSize.body,
        color: colors.card.text,
        fontFamily: typography.fontFamily.medium,
    },

    // Name Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 440,
        alignSelf: 'center',
        padding: 24,
        gap: 12,
    },
    modalTitle: {
        color: colors.card.text,
        fontSize: typography.fontSize.h3,
        fontFamily: typography.fontFamily.bold,
        textAlign: 'center',
    },
    modalSub: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.regular,
        textAlign: 'center',
        marginBottom: 8,
    },
    nameInput: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 16,
        color: colors.card.text,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.medium,
        textAlign: 'center',
    },
});
