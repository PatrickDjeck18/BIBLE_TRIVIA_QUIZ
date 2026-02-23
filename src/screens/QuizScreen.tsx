import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../components/GlassContainer';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Animated, {
    FadeInDown, ZoomIn, FadeIn, SlideInUp, SlideOutDown,
    BounceIn, withSpring, withTiming, withRepeat, withSequence,
    useAnimatedStyle, useSharedValue, runOnJS, Easing, FadeOut,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft, Trophy, Star, CheckCircle, XCircle,
    Check, X, BookOpen, Lightbulb, RefreshCw, List
} from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { getQuestionsForBook, Question } from '../data/questions';
import { useAds } from '../context/AdContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// ──────────────────────────────────────────────────────────────
// Confetti
// ──────────────────────────────────────────────────────────────
const ConfettiParticle = ({ delay, color, left }: { delay: number; color: string; left: number }) => {
    const rotation = useSharedValue(0);
    const translateY = useSharedValue(-20);

    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 1000 + Math.random() * 500 }), -1);
        translateY.value = withTiming(height + 60, {
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
        });
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { rotateZ: `${rotation.value}deg` }],
        opacity: Math.max(0, 1 - translateY.value / (height + 60)),
    }));

    return (
        <Animated.View
            style={[styles.confetti, { backgroundColor: color, left }, style]}
        />
    );
};

// ──────────────────────────────────────────────────────────────
// Answer Feedback Overlay
// ──────────────────────────────────────────────────────────────
const FeedbackOverlay = ({ type, onDone }: { type: 'correct' | 'wrong' | 'none'; onDone: () => void }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (type === 'none') return;

        scale.value = 0;
        opacity.value = 0;

        scale.value = withSequence(withSpring(1.15, { damping: 7 }), withSpring(1, { damping: 12 }));
        opacity.value = withSequence(
            withTiming(1, { duration: 150 }),
            withTiming(1, { duration: 800 }),
            withTiming(0, { duration: 300 })
        );
        const t = setTimeout(onDone, 1400);
        return () => clearTimeout(t);
    }, [type]);

    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

    if (type === 'none') return null;

    const isCorrect = type === 'correct';
    return (
        <Animated.View style={[styles.feedbackOverlay, animStyle]}>
            <View style={[styles.feedbackCard, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                {isCorrect ? (
                    <>
                        <CheckCircle color={colors.success} size={72} />
                        <Text style={styles.feedbackTextCorrect}>Correct!</Text>
                        <View style={styles.feedbackBadge}>
                            <Star color={colors.gold} size={16} fill={colors.gold} />
                            <Text style={styles.feedbackPoints}>+10 pts</Text>
                        </View>
                    </>
                ) : (
                    <>
                        <XCircle color={colors.error} size={72} />
                        <Text style={styles.feedbackTextWrong}>Incorrect</Text>
                    </>
                )}
            </View>
        </Animated.View>
    );
};

// ──────────────────────────────────────────────────────────────
// Explanation Bottom Sheet  (auto-advances after 5 s)
// ──────────────────────────────────────────────────────────────
const AUTO_ADVANCE_SECS = 5;

const ExplanationSheet = ({
    visible, text, isCorrect, onNext
}: {
    visible: boolean;
    text: string;
    isCorrect: boolean | null;
    onNext: () => void;
}) => {
    const [countdown, setCountdown] = useState(AUTO_ADVANCE_SECS);
    const timerProgress = useSharedValue(1); // 1 → 0 over 5 s

    useEffect(() => {
        if (!visible) return;

        // Reset each time the sheet appears
        setCountdown(AUTO_ADVANCE_SECS);
        timerProgress.value = 1;
        timerProgress.value = withTiming(0, {
            duration: AUTO_ADVANCE_SECS * 1000,
            easing: Easing.linear,
        });

        // Tick every second
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);

        // Auto-advance after 5 s
        const timeout = setTimeout(() => {
            clearInterval(interval);
            onNext();
        }, AUTO_ADVANCE_SECS * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [visible]);

    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${timerProgress.value * 100}%` as any,
    }));

    if (!visible) return null;

    return (
        <View style={styles.explanationSheet}>
            <LinearGradient
                colors={
                    isCorrect
                        ? ['rgba(74,222,128,0.12)', 'rgba(22,163,74,0.06)']
                        : ['rgba(248,113,113,0.12)', 'rgba(239,68,68,0.06)']
                }
                style={styles.explanationGradient}
            >
                <View style={styles.explanationHeader}>
                    <View style={[styles.explanationIconWrap, { backgroundColor: isCorrect ? colors.successDim : colors.errorDim }]}>
                        <Lightbulb color={isCorrect ? colors.success : colors.error} size={20} />
                    </View>
                    <Text style={[styles.explanationTitle, { color: isCorrect ? colors.success : colors.error }]}>
                        {isCorrect ? 'Correct!' : 'Explanation'}
                    </Text>
                    {/* Live countdown badge */}
                    <View style={styles.countdownBadge}>
                        <Text style={styles.countdownText}>{countdown}</Text>
                    </View>
                </View>

                <Text style={styles.explanationText}>{text}</Text>

                {/* Shrinking timer bar */}
                <View style={styles.timerBarBg}>
                    <Animated.View
                        style={[
                            styles.timerBarFill,
                            { backgroundColor: isCorrect ? colors.success : colors.error },
                            progressBarStyle,
                        ]}
                    />
                </View>

                <GlassButton
                    title={`Next Question (${countdown}s) →`}
                    onPress={onNext}
                    variant="primary"
                    style={styles.nextBtn}
                />
            </LinearGradient>
        </View>
    );
};


// ──────────────────────────────────────────────────────────────
// Level Complete
// ──────────────────────────────────────────────────────────────
const LevelComplete = ({
    visible, stars, score, correct, total, onPlayAgain, onGoToLevels,
}: {
    visible: boolean;
    stars: number;
    score: number;
    correct: number;
    total: number;
    onPlayAgain: () => void;
    onGoToLevels: () => void;
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiColors = ['#fbbf24', '#f97316', '#4ade80', '#3b82f6', '#ec4899', '#a78bfa'];

    useEffect(() => {
        if (visible) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4500);
        }
    }, [visible]);

    if (!visible) return null;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
        <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(250)}
            style={styles.completionOverlay}
        >
            {/* Confetti */}
            {showConfetti && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <ConfettiParticle
                            key={i}
                            delay={i * 60}
                            color={confettiColors[i % confettiColors.length]}
                            left={Math.random() * width}
                        />
                    ))}
                </View>
            )}

            <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.completionCard}>
                <LinearGradient
                    colors={['rgba(255, 202, 40, 0.15)', 'rgba(13, 71, 161, 0.4)']}
                    style={styles.completionGradient}
                >
                    {/* Trophy */}
                    <Animated.View entering={BounceIn.delay(300)} style={styles.trophyWrap}>
                        <LinearGradient
                            colors={[colors.gold, '#D97706']}
                            style={styles.trophyCircle}
                        >
                            <Trophy color="#000" size={44} fill="#000" />
                        </LinearGradient>
                    </Animated.View>

                    <Animated.Text entering={FadeInDown.delay(400)} style={styles.completionTitle}>
                        Level Complete!
                    </Animated.Text>

                    {/* Stars */}
                    <Animated.View entering={FadeInDown.delay(500)} style={styles.starsRow}>
                        {[0, 1, 2].map((i) => (
                            <Animated.View key={i} entering={ZoomIn.delay(600 + i * 180).springify()}>
                                <Star
                                    color={colors.gold}
                                    size={42}
                                    fill={i < stars ? colors.gold : 'transparent'}
                                />
                            </Animated.View>
                        ))}
                    </Animated.View>

                    {/* Stats */}
                    <Animated.View entering={FadeInDown.delay(900)} style={styles.completionStats}>
                        <CompletionStat label="Points" value={String(score)} color={colors.gold} />
                        <View style={styles.statDivider} />
                        <CompletionStat label="Correct" value={`${correct}/${total}`} color={colors.success} />
                        <View style={styles.statDivider} />
                        <CompletionStat label="Accuracy" value={`${accuracy}%`} color="#A78BFA" />
                    </Animated.View>

                    {/* Buttons */}
                    <Animated.View entering={SlideInUp.delay(1000)} style={styles.completionBtns}>
                        <GlassButton
                            title="Play Again"
                            onPress={onPlayAgain}
                            variant="primary"
                            icon={<RefreshCw color="#000" size={16} />}
                            style={styles.completionBtn}
                        />
                        <GlassButton
                            title="Levels"
                            onPress={onGoToLevels}
                            variant="secondary"
                            icon={<List color={colors.card.textSecondary} size={16} />}
                            style={styles.completionBtn}
                        />
                    </Animated.View>
                </LinearGradient>
            </Animated.View>
        </Animated.View>
    );
};

const CompletionStat = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <View style={styles.completionStatItem}>
        <Text style={[styles.completionStatValue, { color }]}>{value}</Text>
        <Text style={styles.completionStatLabel}>{label}</Text>
    </View>
);

// ──────────────────────────────────────────────────────────────
// Main Quiz Screen
// ──────────────────────────────────────────────────────────────
type AnswerFeedback = 'none' | 'correct' | 'wrong';

export default function QuizScreen() {
    const router = useRouter();
    const { levelId } = useLocalSearchParams<{ levelId: string }>();
    const { state, addPoints, completeLevel, recordAnswers } = useGame();
    const { showInterstitial, showRewarded } = useAds();
    const insets = useSafeAreaInsets();

    const [questionIndex, setQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [feedback, setFeedback] = useState<AnswerFeedback>('none');
    const [showComplete, setShowComplete] = useState(false);

    const shakeX = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (levelId) {
            const qs = getQuestionsForBook(levelId);
            setQuestions([...qs].sort(() => Math.random() - 0.5).slice(0, 10));
        }
    }, [levelId]);

    const currentQ = questions[questionIndex];
    const total = questions.length;
    const progressPct = total > 0 ? ((questionIndex) / total) * 100 : 0;

    const triggerShake = () => {
        shakeX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withSequence(withTiming(10, { duration: 80 }), withTiming(-10, { duration: 80 })), 3, true),
            withTiming(0, { duration: 50 })
        );
    };

    const triggerPulse = () => {
        pulseScale.value = withSequence(
            withTiming(1.06, { duration: 120 }),
            withTiming(1, { duration: 120 })
        );
    };

    const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
    const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !currentQ) return;
        setSelectedAnswer(answer);
        const ok = answer === currentQ.correctAnswer;
        setIsCorrect(ok);
        if (ok) {
            setFeedback('correct');
            setScore(p => p + 10);
            setCorrect(p => p + 1);
            triggerPulse();
        } else {
            setFeedback('wrong');
            triggerShake();
        }
        setTimeout(() => {
            setFeedback('none');
            setShowExplanation(true);
        }, 1300);
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowExplanation(false);
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(p => p + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        showRewarded(
            () => finalizeQuiz(true),
            () => finalizeQuiz(false)
        );
    };

    const finalizeQuiz = (rewarded: boolean) => {
        const finalScore = score + (rewarded ? 50 : 0);
        recordAnswers(questions.length, correct);
        addPoints(finalScore);
        if (levelId) completeLevel(levelId, finalScore, correct, questions.length);
        setIsFinished(true);
        setShowComplete(true);
    };

    const handlePlayAgain = () => {
        setQuestionIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setScore(0);
        setCorrect(0);
        setIsFinished(false);
        setShowExplanation(false);
        setShowComplete(false);
        if (levelId) {
            const qs = getQuestionsForBook(levelId);
            setQuestions([...qs].sort(() => Math.random() - 0.5).slice(0, 10));
        }
    };

    const handleGoToLevels = () => {
        showInterstitial(() => {
            if (router.canGoBack()) router.back();
            else router.replace('/levels');
        });
    };

    const handleBack = () => {
        showInterstitial(() => {
            if (router.canGoBack()) router.back();
            else router.replace('/levels');
        });
    };

    const getStars = () => {
        if (total === 0) return 0;
        const pct = (correct / total) * 100;
        return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
    };

    const bookName = levelId
        ? levelId.charAt(0).toUpperCase() + levelId.slice(1).replace(/-/g, ' ')
        : 'Biblical';

    return (
        <AnimatedBackground variant="quiz">
            <View style={[styles.container, { paddingTop: insets.top || 40 }]}>

                {/* ── Top Bar ── */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                        <ArrowLeft color={colors.card.text} size={22} />
                    </TouchableOpacity>

                    <View style={styles.progressSection}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                        </View>
                        <Text style={styles.progressLabel}>
                            {questionIndex + 1} / {total || '—'}
                        </Text>
                    </View>

                    <Animated.View style={[styles.scoreChip, pulseStyle]}>
                        <Star color={colors.gold} size={14} fill={colors.gold} />
                        <Text style={styles.scoreText}>{state.totalPoints + score}</Text>
                    </Animated.View>
                </View>

                {/* ── Question Card ── */}
                <Animated.View style={[styles.questionArea, shakeStyle]}>
                    <GlassContainer variant="elevated" gradient style={styles.questionCard}>
                        {/* Book badge */}
                        <View style={styles.bookBadge}>
                            <BookOpen color={colors.accent} size={13} />
                            <Text style={styles.bookName}>{bookName}</Text>
                            <View style={styles.categoryPill}>
                                <Text style={styles.categoryText}>Q{questionIndex + 1}</Text>
                            </View>
                        </View>

                        {/* Question text */}
                        <Animated.View key={`q-${questionIndex}`} entering={FadeInDown.springify()}>
                            <Text style={styles.questionText}>
                                {currentQ?.text ?? '…'}
                            </Text>
                        </Animated.View>
                    </GlassContainer>
                </Animated.View>

                {/* ── Options ── */}
                <ScrollView
                    contentContainerStyle={styles.optionsScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {currentQ?.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isAnswerCorrect = option === currentQ.correctAnswer;

                        let variant: 'primary' | 'secondary' | 'success' | 'error' = 'secondary';
                        let trailingIcon: React.ReactNode = null;

                        if (selectedAnswer) {
                            if (isAnswerCorrect) {
                                variant = 'success';
                                trailingIcon = <Check color="#000" size={18} strokeWidth={3} />;
                            } else if (isSelected) {
                                variant = 'error';
                                trailingIcon = <X color={colors.error} size={18} strokeWidth={3} />;
                            }
                        }

                        const label = String.fromCharCode(65 + index);

                        return (
                            <Animated.View
                                key={`${questionIndex}-${option}`}
                                entering={FadeInDown.delay(80 + index * 60).springify()}
                            >
                                <GlassButton
                                    title={option}
                                    label={label}
                                    icon={trailingIcon ?? undefined}
                                    onPress={() => handleAnswer(option)}
                                    style={styles.optionBtn}
                                    variant={variant}
                                    disabled={selectedAnswer !== null}
                                />
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* ── Feedback Overlay ── */}
                <FeedbackOverlay type={feedback} onDone={() => { }} />

                {/* ── Explanation Sheet ── */}
                {showExplanation && (
                    <ExplanationSheet
                        visible={showExplanation}
                        text={currentQ?.explanation ?? ''}
                        isCorrect={isCorrect}
                        onNext={handleNext}
                    />
                )}

                {/* ── Level Complete ── */}
                <LevelComplete
                    visible={showComplete}
                    stars={getStars()}
                    score={score}
                    correct={correct}
                    total={total}
                    onPlayAgain={handlePlayAgain}
                    onGoToLevels={handleGoToLevels}
                />
            </View>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 18 },

    // Top Bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    backBtn: { padding: 6 },
    progressSection: { flex: 1, gap: 4 },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(15,23,42,0.08)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    progressLabel: {
        color: colors.card.textSecondary,
        fontSize: 11,
        fontFamily: typography.fontFamily.medium,
        letterSpacing: typography.letterSpacing.wide,
        textAlign: 'right',
    },
    scoreChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.goldDim,
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.30)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    scoreText: {
        color: colors.gold,
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },

    // Question card
    questionArea: { marginBottom: 18 },
    questionCard: { gap: 14 },
    bookBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bookName: {
        color: colors.accent,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
        flex: 1,
        letterSpacing: typography.letterSpacing.wide,
    },
    categoryPill: {
        backgroundColor: colors.accentDim,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    categoryText: {
        color: colors.accent,
        fontSize: 10,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.wider,
    },
    questionText: {
        color: colors.card.text,
        fontSize: 20,
        lineHeight: 30,
        fontFamily: typography.fontFamily.regular,
    },

    // Options
    optionsScroll: { gap: 10, paddingBottom: 40 },
    optionBtn: { width: '100%' },

    // Feedback overlay
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
    },
    feedbackCard: {
        alignItems: 'center',
        gap: 12,
        padding: 36,
        borderRadius: 24,
        borderWidth: 1,
    },
    feedbackCorrect: {
        backgroundColor: 'rgba(74,222,128,0.12)',
        borderColor: 'rgba(74,222,128,0.30)',
    },
    feedbackWrong: {
        backgroundColor: 'rgba(248,113,113,0.12)',
        borderColor: 'rgba(248,113,113,0.30)',
    },
    feedbackTextCorrect: {
        color: colors.success,
        fontSize: 28,
        fontFamily: typography.fontFamily.bold,
    },
    feedbackTextWrong: {
        color: colors.error,
        fontSize: 28,
        fontFamily: typography.fontFamily.bold,
    },
    feedbackBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.goldDim,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    feedbackPoints: {
        color: colors.gold,
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },

    // Confetti
    confetti: {
        position: 'absolute',
        width: 9,
        height: 14,
        borderRadius: 3,
        top: 0,
    },

    // Explanation sheet
    explanationSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    explanationGradient: {
        padding: 24,
        gap: 14,
        borderWidth: 1,
        borderColor: colors.card.border,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    explanationIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    explanationTitle: {
        fontSize: typography.fontSize.h4,
        fontFamily: typography.fontFamily.bold,
    },
    explanationText: {
        color: colors.card.text,
        fontSize: typography.fontSize.body,
        lineHeight: 26,
        fontFamily: typography.fontFamily.regular,
    },
    nextBtn: { width: '100%' },

    // Auto-advance countdown
    countdownBadge: {
        marginLeft: 'auto' as any,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 30,
        alignItems: 'center',
    },
    countdownText: {
        color: colors.card.text,
        fontSize: 13,
        fontFamily: typography.fontFamily.bold,
    },
    timerBarBg: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.10)',
        overflow: 'hidden',
        width: '100%',
    },
    timerBarFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Level complete
    completionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2,6,23,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: 20,
    },
    completionCard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.card.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    completionGradient: { padding: 28, alignItems: 'center', gap: 14 },
    trophyWrap: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 24,
    },
    trophyCircle: {
        width: 90, height: 90, borderRadius: 45,
        alignItems: 'center', justifyContent: 'center',
    },
    completionTitle: {
        fontSize: typography.fontSize.h2,
        fontFamily: typography.fontFamily.bold,
        color: colors.card.text,
        letterSpacing: typography.letterSpacing.tight,
    },
    starsRow: { flexDirection: 'row', gap: 12 },
    completionStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 18,
        width: '100%',
        alignItems: 'center',
    },
    statDivider: {
        width: 1, height: 40,
        backgroundColor: 'rgba(255,255,255,0.10)',
        marginHorizontal: 8,
    },
    completionStatItem: { flex: 1, alignItems: 'center', gap: 4 },
    completionStatValue: {
        fontSize: 22,
        fontFamily: typography.fontFamily.bold,
    },
    completionStatLabel: {
        color: colors.card.textSecondary,
        fontSize: 11,
        fontFamily: typography.fontFamily.medium,
        textTransform: 'uppercase',
        letterSpacing: typography.letterSpacing.wide,
    },
    completionBtns: { flexDirection: 'row', gap: 12, width: '100%' },
    completionBtn: { flex: 1 },
});
