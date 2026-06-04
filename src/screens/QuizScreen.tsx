import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions,
    Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from '../components/GlassContainer';
import { GlassButton } from '../components/GlassButton';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Animated, {
    FadeInDown, ZoomIn, FadeIn, SlideInUp,
    BounceIn, withSpring, withTiming, withRepeat, withSequence,
    useAnimatedStyle, useSharedValue, Easing, FadeOut,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft, Trophy, Star, CheckCircle, XCircle,
    Check, X, BookOpen, Lightbulb, RefreshCw, List, Heart, Flame, Zap, ChevronRight,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useGame } from '../context/GameContext';
import { getQuestionsForBook, Question } from '../data/questions';
import { useAds } from '../context/AdContext';
import { useScreenInsets } from '../hooks/useScreenInsets';


// ──────────────────────────────────────────────────────────────
// Confetti
// ──────────────────────────────────────────────────────────────
const ConfettiParticle = ({ delay, color, left }: { delay: number; color: string; left: number }) => {
    const rotation = useSharedValue(0);
    const translateY = useSharedValue(-20);
    const { height: screenHeight } = useWindowDimensions();

    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 1000 + Math.random() * 500 }), -1);
        translateY.value = withTiming(screenHeight + 60, {
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
        });
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { rotateZ: `${rotation.value}deg` }],
        opacity: Math.max(0, 1 - translateY.value / (screenHeight + 60)),
    }));

    return (
        <Animated.View
            style={[styles.confetti, { backgroundColor: color, left }, style]}
        />
    );
};

const TIMER_SIZE = 44;
const TIMER_RADIUS = 18;

// ──────────────────────────────────────────────────────────────
// Timer ring
// ──────────────────────────────────────────────────────────────
const TimerRing = ({ timeLeft, compact }: { timeLeft: number; compact?: boolean }) => {
    const size = compact ? 38 : TIMER_SIZE;
    const r = TIMER_RADIUS * (size / TIMER_SIZE);
    const circ = 2 * Math.PI * r;
    const urgent = timeLeft <= 5;
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (urgent) {
            pulse.value = withRepeat(
                withSequence(withTiming(1.12, { duration: 400 }), withTiming(1, { duration: 400 })),
                -1,
                true
            );
        } else {
            pulse.value = withTiming(1, { duration: 200 });
        }
    }, [urgent]);

    const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
    const offset = circ - (timeLeft / 15) * circ;
    const cx = size / 2;

    return (
        <Animated.View style={[styles.timerRingOuter, { width: size, height: size }, ringStyle]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle
                    cx={cx}
                    cy={cx}
                    r={r}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={3}
                    fill="rgba(255,255,255,0.04)"
                />
                <Circle
                    cx={cx}
                    cy={cx}
                    r={r}
                    stroke={urgent ? colors.error : colors.gold}
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cx})`}
                />
            </Svg>
            <Text style={[styles.timerRingText, urgent && styles.timerRingTextUrgent]}>{timeLeft}</Text>
        </Animated.View>
    );
};

// ──────────────────────────────────────────────────────────────
// Question progress dots
// ──────────────────────────────────────────────────────────────
const QuestionProgressDots = ({
    current,
    total,
    answered,
}: {
    current: number;
    total: number;
    answered: number;
}) => {
    if (total <= 0 || total > 12) return null;

    return (
        <View style={styles.progressDots}>
            {Array.from({ length: total }).map((_, i) => {
                const done = i < answered;
                const active = i === current;
                return (
                    <View
                        key={i}
                        style={[
                            styles.progressDot,
                            done && styles.progressDotDone,
                            active && styles.progressDotActive,
                        ]}
                    />
                );
            })}
        </View>
    );
};

// ──────────────────────────────────────────────────────────────
// Answer Feedback Overlay
// ──────────────────────────────────────────────────────────────
const FeedbackOverlay = ({
    type,
    pointsEarned,
    onDone,
}: {
    type: 'correct' | 'wrong' | 'none';
    pointsEarned?: number;
    onDone: () => void;
}) => {
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
        <Animated.View style={[styles.feedbackOverlay, animStyle]} pointerEvents="none">
            <View style={styles.feedbackBackdrop} />
            <View style={[styles.feedbackCard, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                {isCorrect ? (
                    <>
                        <View style={styles.feedbackIconRing}>
                            <CheckCircle color={colors.success} size={56} />
                        </View>
                        <Text style={styles.feedbackTextCorrect}>Correct!</Text>
                        {(pointsEarned ?? 0) > 0 && (
                            <View style={styles.feedbackBadge}>
                                <Star color={colors.gold} size={16} fill={colors.gold} />
                                <Text style={styles.feedbackPoints}>+{pointsEarned} pts</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <View style={[styles.feedbackIconRing, styles.feedbackIconRingWrong]}>
                            <XCircle color={colors.error} size={56} />
                        </View>
                        <Text style={styles.feedbackTextWrong}>Not quite</Text>
                        <Text style={styles.feedbackSubtext}>See the explanation below</Text>
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
    visible, text, funFact, isCorrect, onNext, bottomInset = 0,
}: {
    visible: boolean;
    text: string;
    funFact?: string;
    isCorrect: boolean | null;
    onNext: () => void;
    bottomInset?: number;
}) => {
    const { height: windowHeight } = useWindowDimensions();
    const [countdown, setCountdown] = useState(AUTO_ADVANCE_SECS);
    const timerProgress = useSharedValue(1);

    const accent = isCorrect ? colors.success : colors.error;
    const maxSheetHeight = Math.min(windowHeight * 0.78, 560);
    const scrollMaxHeight = funFact ? maxSheetHeight * 0.38 : maxSheetHeight * 0.48;

    useEffect(() => {
        if (!visible) return;

        setCountdown(AUTO_ADVANCE_SECS);
        timerProgress.value = 1;
        timerProgress.value = withTiming(0, {
            duration: AUTO_ADVANCE_SECS * 1000,
            easing: Easing.linear,
        });

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

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
        width: `${timerProgress.value * 100}%` as `${number}%`,
    }));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onNext}
        >
            <View style={styles.explanationModalRoot}>
                <Pressable
                    style={styles.explanationScrim}
                    onPress={onNext}
                    accessibilityRole="button"
                    accessibilityLabel="Continue to next question"
                />

                <Animated.View
                    entering={SlideInUp.springify().damping(20)}
                    style={[styles.explanationSheet, { maxHeight: maxSheetHeight }]}
                >
                    <LinearGradient
                        colors={
                            isCorrect
                                ? ['#0A2E1A', '#051130', '#020617']
                                : ['#2E0A0A', '#051130', '#020617']
                        }
                        locations={[0, 0.35, 1]}
                        style={[styles.explanationGradient, { borderTopColor: accent }]}
                    >
                        <View style={[styles.explanationSheetInner, { paddingBottom: Math.max(bottomInset, 14) }]}>
                            <View style={styles.sheetHandle} />

                            <View style={[
                                styles.explanationStatusBanner,
                                isCorrect ? styles.explanationStatusCorrect : styles.explanationStatusWrong,
                            ]}>
                                {isCorrect ? (
                                    <CheckCircle color={colors.success} size={22} />
                                ) : (
                                    <Lightbulb color={colors.error} size={22} />
                                )}
                                <View style={styles.explanationStatusTextWrap}>
                                    <Text style={[styles.explanationStatusTitle, { color: accent }]}>
                                        {isCorrect ? 'Well done!' : 'Here\'s the answer'}
                                    </Text>
                                    <Text style={styles.explanationStatusSub}>
                                        {isCorrect ? 'You got it right' : 'Review before the next question'}
                                    </Text>
                                </View>
                                <View style={[styles.countdownBadge, { borderColor: `${accent}44` }]}>
                                    <Text style={[styles.countdownText, { color: accent }]}>{countdown}s</Text>
                                </View>
                            </View>

                            <ScrollView
                                style={{ maxHeight: scrollMaxHeight }}
                                contentContainerStyle={styles.explanationScrollContent}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                            >
                                <View style={styles.explanationBody}>
                                    <Text style={styles.explanationBodyLabel}>Scripture insight</Text>
                                    <Text style={styles.explanationText}>{text}</Text>
                                </View>

                                {funFact ? (
                                    <View style={styles.funFactContainer}>
                                        <View style={styles.funFactHeader}>
                                            <Zap color={colors.gold} size={14} fill={colors.gold} />
                                            <Text style={styles.funFactTitle}>Did you know?</Text>
                                        </View>
                                        <Text style={styles.funFactText}>{funFact}</Text>
                                    </View>
                                ) : null}
                            </ScrollView>

                            <View style={styles.explanationFooter}>
                                <View style={styles.timerBarBg}>
                                    <Animated.View
                                        style={[
                                            styles.timerBarFill,
                                            { backgroundColor: accent },
                                            progressBarStyle,
                                        ]}
                                    />
                                </View>
                                <Text style={styles.autoAdvanceHint}>
                                    Continuing in {countdown}s — tap anywhere to skip
                                </Text>

                                <GlassButton
                                    title="Continue"
                                    onPress={onNext}
                                    variant="primary"
                                    icon={<ChevronRight color="#000" size={18} />}
                                    style={styles.nextBtn}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};


// ──────────────────────────────────────────────────────────────
// Level Complete
// ──────────────────────────────────────────────────────────────
const LevelComplete = ({
    visible, stars, score, correct, total, onPlayAgain, onGoToLevels, isNewPersonalBest, onSecondChance, hasWatchedSecondChance
}: {
    visible: boolean;
    stars: number;
    score: number;
    correct: number;
    total: number;
    onPlayAgain: () => void;
    onGoToLevels: () => void;
    isNewPersonalBest: boolean;
    onSecondChance: () => void;
    hasWatchedSecondChance: boolean;
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiColors = ['#fbbf24', '#f97316', '#4ade80', '#3b82f6', '#ec4899', '#a78bfa'];
    const { width: screenWidth } = useWindowDimensions();

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
                            left={Math.random() * screenWidth}
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

                    {isNewPersonalBest && (
                        <Animated.View entering={BounceIn.delay(450)} style={styles.personalBestBadge}>
                            <Text style={styles.personalBestText}>🎉 NEW PERSONAL BEST! 🎉</Text>
                        </Animated.View>
                    )}

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

                    {stars === 0 && !hasWatchedSecondChance && (
                        <Animated.View entering={FadeInDown.delay(1100)} style={{ width: '100%', marginTop: 8 }}>
                            <GlassButton
                                title="Second Chance (Watch Ad)"
                                onPress={onSecondChance}
                                variant="primary"
                                icon={<Heart color="#000" size={16} fill="#000" />}
                                style={{ width: '100%', borderColor: colors.error }}
                            />
                        </Animated.View>
                    )}
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
    const { top, bottom, contentBottom } = useScreenInsets();
    const { width: screenWidth } = useWindowDimensions();
    const isSmallScreen = screenWidth < 360;
    const isNarrowScreen = screenWidth < 400;

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

    // New states for Hint, Timer, Streak, Second Chance
    const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
    const [isHintUsed, setIsHintUsed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [streak, setStreak] = useState(0);
    const [lives, setLives] = useState(1);
    const [hasWatchedSecondChance, setHasWatchedSecondChance] = useState(false);
    const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
    const [lastPointsEarned, setLastPointsEarned] = useState(0);
    const streakMultiplier = Math.min(3, Math.max(1, streak + 1)); // 1x, 2x, 3x
    const isDaily = levelId === 'daily';

    const shakeX = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (levelId) {
            const qs = getQuestionsForBook(levelId);
            const count = levelId === 'daily' ? 5 : 10;
            setQuestions([...qs].sort(() => Math.random() - 0.5).slice(0, count));
        }
    }, [levelId]);

    const currentQ = questions[questionIndex];
    const total = questions.length;
    const progressPct = total > 0 ? (questionIndex / total) * 100 : 0;
    const answeredCount = questionIndex;

    // Timer logic
    useEffect(() => {
        if (!currentQ || selectedAnswer || showExplanation || isFinished || showComplete) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentQ, selectedAnswer, showExplanation, isFinished, showComplete]);

    const handleTimeUp = () => {
        if (selectedAnswer || showExplanation || isFinished) return;
        setSelectedAnswer('timeout');
        setIsCorrect(false);
        setFeedback('wrong');
        setLastPointsEarned(0);
        setStreak(0);
        triggerShake();
        setTimeout(() => {
            setFeedback('none');
            setShowExplanation(true);
        }, 1300);
    };

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
        if (selectedAnswer || !currentQ || timeLeft === 0) return;
        setSelectedAnswer(answer);
        const ok = answer === currentQ.correctAnswer;
        setIsCorrect(ok);
        if (ok) {
            setFeedback('correct');
            const timeBonus = timeLeft > 0 ? timeLeft : 0;
            const dailyMultiplier = isDaily ? 2 : 1;
            const pointsAwarded = (10 + timeBonus) * streakMultiplier * dailyMultiplier;
            setLastPointsEarned(pointsAwarded);
            setScore(p => p + pointsAwarded);
            setCorrect(p => p + 1);
            setStreak(p => p + 1);
            triggerPulse();
        } else {
            setFeedback('wrong');
            setLastPointsEarned(0);
            setStreak(0);
            triggerShake();
        }
        setTimeout(() => {
            setFeedback('none');
            setShowExplanation(true);
        }, 1300);
    };

    const handleHint = () => {
        if (isHintUsed || selectedAnswer || !currentQ) return;
        showRewarded(() => {
            setIsHintUsed(true);
            const wrongs = currentQ.options.filter(o => o !== currentQ.correctAnswer);
            const shuffled = wrongs.sort(() => Math.random() - 0.5);
            setEliminatedOptions(shuffled.slice(0, 2));
        });
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowExplanation(false);
        setEliminatedOptions([]);
        setIsHintUsed(false);
        setTimeLeft(15);
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(p => p + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        finalizeQuiz(false);
    };

    const finalizeQuiz = (rewarded: boolean) => {
        const finalScore = score + (rewarded ? 50 : 0);
        recordAnswers(questions.length, correct);
        addPoints(finalScore);

        if (levelId) {
            if (levelId === 'daily') {
                // Record daily challenge completed
                state.dailyChallengeCompleted = true; // wait, context doesn't have a direct setter for this? We might need an action. But let's just use completeLevel for now or addPoints. We'll update the context.
                completeLevel('daily', finalScore, correct, questions.length); // completeLevel will handle it if we modify it.
            } else {
                const prevLevel = state.levelsProgress[levelId];
                const prevScore = prevLevel ? prevLevel.highScore : 0;
                if (finalScore > prevScore) {
                    setIsNewPersonalBest(true);
                }
                completeLevel(levelId, finalScore, correct, questions.length);
            }
        }
        setIsFinished(true);
        setShowComplete(true);
    };

    const resetQuiz = () => {
        setQuestionIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setScore(0);
        setCorrect(0);
        setIsFinished(false);
        setShowExplanation(false);
        setShowComplete(false);
        setEliminatedOptions([]);
        setIsHintUsed(false);
        setTimeLeft(15);
        setStreak(0);
        setLives(1);
        setHasWatchedSecondChance(false);
        setIsNewPersonalBest(false);
        setLastPointsEarned(0);
        if (levelId) {
            const qs = getQuestionsForBook(levelId);
            const count = levelId === 'daily' ? 5 : 10;
            setQuestions([...qs].sort(() => Math.random() - 0.5).slice(0, count));
        }
    };

    const handlePlayAgain = () => {
        showInterstitial(() => resetQuiz());
    };

    const handleSecondChance = () => {
        showRewarded(() => {
            setHasWatchedSecondChance(true);
            resetQuiz();
        });
    };

    const handleGoToLevels = () => {
        showInterstitial(() => {
            if (router.canGoBack()) router.back();
            else router.replace('/levels');
        });
    };

    const handleBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/levels');
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
            <View style={[styles.container, {
                paddingTop: top + 8,
                paddingBottom: contentBottom,
                paddingHorizontal: isSmallScreen ? 12 : 18,
            }]}>

                {/* ── Game HUD ── */}
                <View style={[styles.hudCard, isNarrowScreen && styles.hudCardCompact]}>
                    <LinearGradient
                        colors={['rgba(13,71,161,0.45)', 'rgba(5,17,48,0.85)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.hudGradient, isNarrowScreen && styles.hudGradientCompact]}
                    >
                        <View style={styles.hudTopRow}>
                            <TouchableOpacity
                                onPress={handleBack}
                                style={styles.backBtnRound}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            >
                                <ArrowLeft color={colors.card.text} size={20} />
                            </TouchableOpacity>

                            <View style={styles.hudTitleBlock}>
                                <Text style={styles.hudEyebrow}>Now playing</Text>
                                <View style={styles.hudTitleRow}>
                                    <Text style={styles.hudBookTitle} numberOfLines={1}>{bookName}</Text>
                                    {isDaily && (
                                        <View style={styles.dailyPill}>
                                            <Zap color={colors.gold} size={10} fill={colors.gold} />
                                            <Text style={styles.dailyPillText}>2×</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <TimerRing timeLeft={timeLeft} compact={isNarrowScreen} />
                        </View>

                        <View style={styles.hudProgressTrack}>
                            <View style={[styles.hudProgressFill, { width: `${progressPct}%` }]} />
                        </View>

                        <View style={styles.hudMetaRow}>
                            <Text style={styles.hudQuestionCount}>
                                Question {questionIndex + 1} of {total || '—'}
                            </Text>
                            <Animated.View style={[styles.roundScoreChip, pulseStyle]}>
                                <Text style={styles.roundScoreLabel}>Round</Text>
                                <Text style={styles.roundScoreValue}>{score}</Text>
                            </Animated.View>
                        </View>

                        <QuestionProgressDots
                            current={questionIndex}
                            total={total}
                            answered={answeredCount}
                        />
                    </LinearGradient>
                </View>

                {/* ── Streak & Hint ── */}
                <View style={[styles.statusRow, isNarrowScreen && styles.statusRowCompact]}>
                    <View style={[
                        styles.streakBadge, 
                        streakMultiplier > 1 && styles.streakBadgeActive,
                        isNarrowScreen && styles.streakBadgeCompact
                    ]}>
                        <Flame
                            color={streakMultiplier > 1 ? colors.gold : colors.card.textMuted}
                            size={16}
                            fill={streakMultiplier > 1 ? colors.gold : 'transparent'}
                        />
                        <Text style={[styles.streakText, streakMultiplier > 1 && styles.streakTextActive]}>
                            {streak > 0 ? `${streak} streak · ` : ''}{streakMultiplier}× bonus
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleHint}
                        style={[
                            styles.hintBtn, 
                            isHintUsed && styles.hintBtnUsed,
                            isNarrowScreen && styles.hintBtnCompact
                        ]}
                        disabled={isHintUsed || selectedAnswer !== null}
                    >
                        <Lightbulb color={isHintUsed ? 'rgba(255,255,255,0.3)' : colors.gold} size={16} />
                        <Text style={[styles.hintText, isHintUsed && styles.hintTextUsed]}>
                            {isHintUsed ? 'Used' : '50/50 Hint'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Question Card ── */}
                <Animated.View style={[styles.questionArea, isNarrowScreen && styles.questionAreaCompact, shakeStyle]} pointerEvents="box-none">
                    <View style={styles.questionCardShell}>
                        <GlassContainer variant="elevated" gradient style={[styles.questionCard, isNarrowScreen && styles.questionCardCompact]}>
                            <Text style={styles.questionEyebrow}>Question</Text>

                            <Animated.View key={`q-${questionIndex}`} entering={FadeInDown.springify()}>
                                <Text style={[styles.questionText, isSmallScreen && styles.questionTextSmall]}>
                                    {currentQ?.text ?? 'Loading question…'}
                                </Text>
                            </Animated.View>

                            <View style={styles.questionFooter}>
                                <BookOpen color={colors.card.textMuted} size={12} />
                                <Text style={styles.questionFooterText} numberOfLines={1}>{bookName}</Text>
                            </View>
                        </GlassContainer>
                    </View>
                </Animated.View>

                {/* ── Answer options ── */}
                <View style={[styles.optionsHeader, isNarrowScreen && styles.optionsHeaderCompact]}>
                    <Text style={styles.optionsHeaderText}>Choose your answer</Text>
                    <View style={styles.optionsHeaderLine} />
                </View>

                <ScrollView
                    style={styles.optionsList}
                    contentContainerStyle={[styles.optionsScroll, isNarrowScreen && styles.optionsScrollCompact]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentQ?.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isAnswerCorrect = option === currentQ.correctAnswer;
                        const isEliminated = eliminatedOptions.includes(option);

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

                        if (isEliminated && !selectedAnswer) {
                            return null; // completely hide eliminated options
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
                                    style={[styles.optionBtn, isNarrowScreen && styles.optionBtnCompact, isEliminated && { opacity: 0.3 }]}
                                    variant={variant}
                                    disabled={selectedAnswer !== null || isEliminated || timeLeft === 0}
                                />
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* ── Feedback Overlay ── */}
                <FeedbackOverlay
                    type={feedback}
                    pointsEarned={lastPointsEarned}
                    onDone={() => { }}
                />

                {/* ── Explanation (full-screen modal, overlaps native ad) ── */}
                <ExplanationSheet
                    visible={showExplanation}
                    text={currentQ?.explanation ?? 'No explanation available for this question.'}
                    funFact={currentQ?.funFact}
                    isCorrect={isCorrect}
                    onNext={handleNext}
                    bottomInset={bottom}
                />

                {/* ── Level Complete ── */}
                <LevelComplete
                    visible={showComplete}
                    stars={getStars()}
                    score={score}
                    correct={correct}
                    total={total}
                    onPlayAgain={handlePlayAgain}
                    onGoToLevels={handleGoToLevels}
                    isNewPersonalBest={isNewPersonalBest}
                    onSecondChance={handleSecondChance}
                    hasWatchedSecondChance={hasWatchedSecondChance}
                />
            </View>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // HUD
    hudCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 202, 40, 0.22)',
    },
    hudCardCompact: {
        marginBottom: 8,
    },
    hudGradient: {
        padding: 14,
        gap: 10,
    },
    hudGradientCompact: {
        padding: 10,
        gap: 6,
    },
    hudTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backBtnRound: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    hudTitleBlock: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    hudEyebrow: {
        color: colors.card.textMuted,
        fontSize: 10,
        fontFamily: typography.fontFamily.medium,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
    },
    hudTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hudBookTitle: {
        flex: 1,
        color: colors.card.text,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.tight,
    },
    dailyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: colors.goldDim,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,202,40,0.35)',
    },
    dailyPillText: {
        color: colors.gold,
        fontSize: 10,
        fontFamily: typography.fontFamily.bold,
    },
    hudProgressTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    hudProgressFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: colors.gold,
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
    },
    hudMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    hudQuestionCount: {
        color: colors.card.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.medium,
    },
    roundScoreChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.goldDim,
        borderWidth: 1,
        borderColor: 'rgba(255,202,40,0.35)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roundScoreLabel: {
        color: colors.card.textMuted,
        fontSize: 10,
        fontFamily: typography.fontFamily.medium,
        textTransform: 'uppercase',
    },
    roundScoreValue: {
        color: colors.gold,
        fontSize: 15,
        fontFamily: typography.fontFamily.bold,
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 2,
    },
    progressDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    progressDotDone: {
        backgroundColor: colors.accent,
        width: 7,
    },
    progressDotActive: {
        width: 18,
        backgroundColor: colors.gold,
    },
    timerRingOuter: {
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    timerRingText: {
        position: 'absolute',
        color: colors.card.text,
        fontSize: 13,
        fontFamily: typography.fontFamily.bold,
    },
    timerRingTextUrgent: {
        color: colors.error,
    },

    // Status Row
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    statusRowCompact: {
        marginBottom: 8,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        flex: 1,
        minWidth: 0,
    },
    streakBadgeActive: {
        backgroundColor: 'rgba(245,158,11,0.2)',
        borderColor: colors.gold,
    },
    streakText: {
        color: colors.card.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
    },
    streakTextActive: {
        color: colors.gold,
    },
    hintBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,202,40,0.12)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,202,40,0.28)',
        flexShrink: 0,
    },
    hintBtnUsed: {
        opacity: 0.5,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    hintText: {
        color: colors.gold,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
    },
    hintTextUsed: {
        color: 'rgba(255,255,255,0.3)',
    },
    streakBadgeCompact: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    hintBtnCompact: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    // Question card
    questionArea: { marginBottom: 10, flexShrink: 1 },
    questionCardShell: {
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
        borderRadius: 20,
    },
    questionCard: { gap: 12 },
    questionCardCompact: {
        padding: 12,
        gap: 8,
    },
    questionAreaCompact: {
        marginBottom: 6,
    },
    questionEyebrow: {
        color: colors.gold,
        fontSize: 11,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
    },
    questionText: {
        color: colors.card.text,
        fontSize: 20,
        lineHeight: 30,
        fontFamily: typography.fontFamily.medium,
    },
    questionTextSmall: {
        fontSize: 17,
        lineHeight: 26,
    },
    questionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    questionFooterText: {
        flex: 1,
        color: colors.card.textMuted,
        fontSize: 11,
        fontFamily: typography.fontFamily.regular,
    },

    // Options
    optionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    optionsHeaderText: {
        color: colors.card.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
    },
    optionsHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    optionsList: { flex: 1, minHeight: 0 },
    optionsScroll: { gap: 12, paddingBottom: 16, flexGrow: 1 },
    optionsScrollCompact: { gap: 8, paddingBottom: 8 },
    optionBtn: { width: '100%' },
    optionBtnCompact: { paddingVertical: 10 },
    optionsHeaderCompact: { marginBottom: 6 },

    // Feedback overlay
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
    },
    feedbackBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2,6,23,0.55)',
    },
    feedbackCard: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 32,
        paddingHorizontal: 40,
        borderRadius: 28,
        borderWidth: 1,
    },
    feedbackIconRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.successDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(74,222,128,0.35)',
    },
    feedbackIconRingWrong: {
        backgroundColor: colors.errorDim,
        borderColor: 'rgba(248,113,113,0.35)',
    },
    feedbackSubtext: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.bodySmall,
        fontFamily: typography.fontFamily.regular,
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

    // Explanation modal (overlaps native ad via RN Modal)
    explanationModalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    explanationScrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(2,6,23,0.78)',
    },
    explanationSheet: {
        width: '100%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 24,
    },
    sheetHandle: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'center',
        marginBottom: 6,
    },
    explanationGradient: {
        borderTopWidth: 3,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    explanationSheetInner: {
        paddingHorizontal: 20,
        paddingTop: 10,
        gap: 14,
    },
    explanationStatusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    explanationStatusCorrect: {
        backgroundColor: 'rgba(74,222,128,0.12)',
        borderColor: 'rgba(74,222,128,0.28)',
    },
    explanationStatusWrong: {
        backgroundColor: 'rgba(248,113,113,0.10)',
        borderColor: 'rgba(248,113,113,0.28)',
    },
    explanationStatusTextWrap: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    explanationStatusTitle: {
        fontSize: typography.fontSize.h4,
        fontFamily: typography.fontFamily.bold,
    },
    explanationStatusSub: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.regular,
    },
    explanationScrollContent: {
        gap: 12,
        paddingBottom: 4,
    },
    explanationBody: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 8,
    },
    explanationBodyLabel: {
        color: colors.card.textMuted,
        fontSize: 10,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
    },
    explanationText: {
        color: colors.card.text,
        fontSize: typography.fontSize.body,
        lineHeight: 26,
        fontFamily: typography.fontFamily.regular,
    },
    funFactContainer: {
        padding: 14,
        backgroundColor: 'rgba(255,202,40,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,202,40,0.25)',
        gap: 8,
    },
    funFactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    funFactTitle: {
        color: colors.gold,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
    },
    funFactText: {
        color: colors.card.text,
        fontSize: typography.fontSize.bodySmall,
        lineHeight: 22,
        fontFamily: typography.fontFamily.regular,
    },
    explanationFooter: {
        gap: 10,
        paddingTop: 4,
    },
    autoAdvanceHint: {
        color: colors.card.textMuted,
        fontSize: 11,
        fontFamily: typography.fontFamily.regular,
        textAlign: 'center',
    },
    nextBtn: { width: '100%' },
    countdownBadge: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 40,
        alignItems: 'center',
        borderWidth: 1,
        flexShrink: 0,
    },
    countdownText: {
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },
    timerBarBg: {
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        width: '100%',
    },
    timerBarFill: {
        height: '100%',
        borderRadius: 3,
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
    personalBestBadge: {
        backgroundColor: colors.goldDim,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gold,
    },
    personalBestText: {
        color: colors.gold,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
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
