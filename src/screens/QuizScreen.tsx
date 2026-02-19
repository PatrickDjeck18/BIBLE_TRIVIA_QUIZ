import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { GlassContainer } from '../components/GlassContainer';
import { GlassButton } from '../components/GlassButton';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Animated, {
    FadeInDown,
    ZoomIn,
    ZoomInDown,
    FadeIn,
    SlideInUp,
    SlideOutDown,
    BounceIn,
    BounceOut,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    Easing,
    SlideInRight,
    SlideOutRight,
    FadeOut,
    FadeOutDown,
    RollInLeft,
    RollOutRight
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trophy, Star, CheckCircle, XCircle, PartyPopper, Sparkles } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { getQuestionsForBook, Question } from '../data/questions';

import { useAds } from '../context/AdContext';

const { width, height } = Dimensions.get('window');

// Confetti particle component for celebrations
const ConfettiParticle = ({ delay, color, left }: { delay: number; color: string; left: number }) => {
    const rotation = useSharedValue(0);
    const translateY = useSharedValue(-20);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 1000 + Math.random() * 1000 }),
            -1
        );
        translateY.value = withTiming(height + 50, {
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.quad)
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { rotateZ: `${rotation.value}deg` },
            { rotateX: `${rotation.value * 0.5}deg` }
        ],
        opacity: 1 - (translateY.value / (height + 50))
    }));

    return (
        <Animated.View
            style={[
                styles.confettiParticle,
                { backgroundColor: color, left },
                animatedStyle
            ]}
        />
    );
};

// Animated feedback overlay for correct/wrong answers
const AnswerFeedbackOverlay = ({ type, onAnimationEnd }: { type: 'correct' | 'wrong' | 'none'; onAnimationEnd: () => void }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (type !== 'none') {
            scale.value = withSequence(
                withSpring(1.2, { damping: 8 }),
                withSpring(1, { damping: 12 })
            );
            opacity.value = withSequence(
                withTiming(1, { duration: 200 }),
                withTiming(1, { duration: 800 }),
                withTiming(0, { duration: 300 })
            );

            const timer = setTimeout(() => {
                onAnimationEnd();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [type]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value
    }));

    if (type === 'none') return null;

    return (
        <Animated.View style={[styles.feedbackOverlay, animatedStyle]}>
            <View style={[styles.feedbackContainer, type === 'correct' ? styles.correctContainer : styles.wrongContainer]}>
                {type === 'correct' ? (
                    <>
                        <Animated.View entering={BounceIn.delay(200)}>
                            <CheckCircle color={colors.success} size={80} />
                        </Animated.View>
                        <Animated.Text entering={FadeInDown.delay(400)} style={styles.correctText}>
                            Correct!
                        </Animated.Text>
                        <Animated.View entering={ZoomIn.delay(600)} style={styles.pointsBadge}>
                            <Star color="#fbbf24" size={20} fill="#fbbf24" />
                            <Text style={styles.pointsText}>+10</Text>
                        </Animated.View>
                    </>
                ) : (
                    <>
                        <Animated.View entering={BounceIn.delay(200)}>
                            <XCircle color="#ef4444" size={80} />
                        </Animated.View>
                        <Animated.Text entering={FadeInDown.delay(400)} style={styles.wrongText}>
                            Incorrect
                        </Animated.Text>
                    </>
                )}
            </View>
        </Animated.View>
    );
};

// Level Complete Celebration Component
const LevelCompleteCelebration = ({
    visible,
    stars,
    score,
    correctAnswers,
    totalQuestions,
    onPlayAgain,
    onGoToLevels,
    onClose
}: {
    visible: boolean;
    stars: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    onPlayAgain: () => void;
    onGoToLevels: () => void;
    onClose: () => void;
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiColors = ['#fbbf24', '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

    useEffect(() => {
        if (visible) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.celebrationOverlay}
        >
            {/* Confetti */}
            {showConfetti && (
                <View style={styles.confettiContainer} pointerEvents="none">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <ConfettiParticle
                            key={i}
                            delay={i * 50}
                            color={confettiColors[i % confettiColors.length]}
                            left={Math.random() * width}
                        />
                    ))}
                </View>
            )}

            <Animated.View
                entering={ZoomIn.springify().damping(12)}
                style={styles.celebrationCard}
            >
                <GlassContainer style={styles.celebrationContent} intensity={90}>
                    {/* Trophy Icon */}
                    <Animated.View
                        entering={BounceIn.delay(300)}
                        style={styles.trophyContainer}
                    >
                        <Trophy color={colors.accent} size={64} fill={colors.accent} />
                    </Animated.View>

                    {/* Title */}
                    <Animated.Text
                        entering={FadeInDown.delay(400)}
                        style={styles.celebrationTitle}
                    >
                        Level Complete!
                    </Animated.Text>

                    {/* Stars */}
                    <Animated.View
                        entering={FadeInDown.delay(500)}
                        style={styles.starsRow}
                    >
                        {[0, 1, 2].map((index) => (
                            <Animated.View
                                key={index}
                                entering={ZoomIn.delay(600 + index * 200).springify()}
                            >
                                <Star
                                    color="#fbbf24"
                                    size={40}
                                    fill={index < stars ? "#fbbf24" : "transparent"}
                                />
                            </Animated.View>
                        ))}
                    </Animated.View>

                    {/* Stats */}
                    <Animated.View
                        entering={FadeInDown.delay(900)}
                        style={styles.celebrationStats}
                    >
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Score</Text>
                            <Text style={styles.statValue}>{score}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Correct</Text>
                            <Text style={styles.statValue}>{correctAnswers}/{totalQuestions}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Accuracy</Text>
                            <Text style={styles.statValue}>
                                {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Buttons */}
                    <Animated.View
                        entering={SlideInUp.delay(1000)}
                        style={styles.celebrationButtons}
                    >
                        <GlassButton
                            title="Play Again"
                            onPress={onPlayAgain}
                            variant="primary"
                            style={styles.celebrationButton}
                        />
                        <GlassButton
                            title="All Levels"
                            onPress={onGoToLevels}
                            variant="secondary"
                            style={styles.celebrationButton}
                        />
                    </Animated.View>
                </GlassContainer>
            </Animated.View>
        </Animated.View>
    );
};

type GamePhase = 'playing' | 'result';
type AnswerFeedback = 'none' | 'correct' | 'wrong';

export default function QuizScreen() {
    const router = useRouter();
    const { levelId } = useLocalSearchParams<{ levelId: string }>();
    const { state, addPoints, completeLevel, recordAnswers } = useGame();
    const { showInterstitial, showRewarded } = useAds();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [gamePhase, setGamePhase] = useState<GamePhase>('playing');
    const [showExplanation, setShowExplanation] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>('none');
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [animatedPoints, setAnimatedPoints] = useState(0);

    // Animation values for wrong answer shake
    const shakeValue = useSharedValue(0);

    // Animation for correct answer pulse
    const pulseValue = useSharedValue(1);

    useEffect(() => {
        if (levelId) {
            const levelQuestions = getQuestionsForBook(levelId);
            // Shuffle and take up to 10 questions
            const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
            setQuestions(shuffled);
        }
    }, [levelId]);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

    // Shake animation for wrong answer
    const triggerShake = () => {
        shakeValue.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withSequence(
                withTiming(10, { duration: 100 }),
                withTiming(-10, { duration: 100 })
            ), 3, true),
            withTiming(0, { duration: 50 })
        );
    };

    // Pulse animation for correct answer
    const triggerPulse = () => {
        pulseValue.value = withSequence(
            withTiming(1.1, { duration: 150 }),
            withTiming(1, { duration: 150 }),
            withTiming(1.05, { duration: 100 }),
            withTiming(1, { duration: 100 })
        );
    };

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeValue.value }]
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseValue.value }]
    }));

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || !currentQuestion) return;

        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);

        // Show answer feedback animation
        if (correct) {
            setAnswerFeedback('correct');
            setScore(prev => prev + 10);
            setCorrectAnswers(prev => prev + 1);
            setAnimatedPoints(10);
            triggerPulse();
        } else {
            setAnswerFeedback('wrong');
            triggerShake();
        }

        // Hide feedback and show explanation after animation
        setTimeout(() => {
            setAnswerFeedback('none');
            setShowExplanation(true);
            setTimeout(() => {
                moveToNextQuestion();
            }, 1500);
        }, 1200);
    };

    const moveToNextQuestion = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowExplanation(false);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Quiz completed
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        // Show Rewarded Ad on completion
        showRewarded(
            () => {
                // User earned reward - maybe double points?
                // For now just proceed
                finalizeQuiz(true);
            },
            () => {
                // Ad closed
                finalizeQuiz(false);
            }
        );
    };

    const finalizeQuiz = (rewarded: boolean) => {
        let finalScore = score;
        if (rewarded) {
            finalScore += 50; // Bonus for watching ad?
        }

        const finalCorrect = correctAnswers;
        const totalAnswered = questions.length;

        // Record stats
        recordAnswers(totalAnswered, finalCorrect);
        addPoints(finalScore);

        if (levelId) {
            completeLevel(levelId, finalScore, finalCorrect, totalAnswered);
        }

        setGamePhase('result');
        setShowLevelComplete(true);
    };

    const handlePlayAgain = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setScore(0);
        setCorrectAnswers(0);
        setGamePhase('playing');
        setShowExplanation(false);
        setShowLevelComplete(false);

        // Reshuffle questions
        if (levelId) {
            const levelQuestions = getQuestionsForBook(levelId);
            const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
            setQuestions(shuffled);
        }
    };

    const handleGoToLevels = () => {
        showInterstitial(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/levels');
            }
        });
    };

    const getStars = (): number => {
        if (totalQuestions === 0) return 0;
        const percentage = (correctAnswers / totalQuestions) * 100;
        if (percentage >= 90) return 3;
        if (percentage >= 70) return 2;
        if (percentage >= 50) return 1;
        return 0;
    };

    // Helper to format question text with highlights
    // Assuming format is regular string for now, but could support Markdown-like highlighting
    const renderQuestionText = (text: string) => {
        // Simple heuristic: highlight words inside *asterisks*
        const parts = text.split(/(\*[^*]+\*)/g);
        return (
            <Text style={styles.questionText}>
                {parts.map((part, index) => {
                    if (part.startsWith('*') && part.endsWith('*')) {
                        return (
                            <Text key={index} style={styles.questionHighlight}>
                                {part.slice(1, -1)}
                            </Text>
                        );
                    }
                    return <Text key={index}>{part}</Text>;
                })}
            </Text>
        );
    };

    const handleBack = () => {
        showInterstitial(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/levels');
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.iconButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft color={colors.card.text} size={24} />
                </TouchableOpacity>

                <View style={styles.headerStats}>
                    <View style={styles.streakContainer}>
                        <Trophy color={colors.accent} size={16} fill={colors.accent} />
                        <Text style={styles.streakText}>{state.currentStreak}</Text>
                    </View>
                    <Animated.View style={[styles.pointsContainer, isCorrect ? pulseStyle : null]}>
                        <Star color="#fbbf24" size={16} fill="#fbbf24" />
                        <Text style={styles.pointsText}>
                            {gamePhase === 'playing' ? state.totalPoints + score : state.totalPoints}
                        </Text>
                    </Animated.View>
                </View>
            </View>

            {/* Main Content Area */}
            <Animated.View style={[styles.contentArea, isCorrect === false ? shakeStyle : null]}>
                <GlassContainer style={styles.questionCard} intensity={20}>
                    {/* Book Info / Citation Badge */}
                    <View style={styles.citationContainer}>
                        <View style={styles.historyBadge}>
                            <Text style={styles.historyText}>HISTOIRE</Text>
                        </View>
                        <Text style={styles.citationText}>
                            Quiz {levelId ? levelId.replace(/^\w/, (c) => c.toUpperCase()) : 'Biblique'}
                        </Text>
                    </View>

                    {/* Question Section */}
                    <Animated.View
                        key={`q-${currentQuestionIndex}`}
                        entering={FadeInDown.springify()}
                        style={styles.questionContainer}
                    >
                        {currentQuestion && renderQuestionText(currentQuestion.text)}

                        <Text style={styles.subText}>
                            Testez vos connaissances bibliques. Sélectionnez la bonne réponse ci-dessous.
                        </Text>
                    </Animated.View>
                </GlassContainer>
            </Animated.View>

            {/* Options Area (Bottom Half) */}
            <View style={styles.optionsArea}>
                <View style={styles.optionsList}>
                    {currentQuestion?.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isAnswerCorrect = option === currentQuestion.correctAnswer;
                        let variant: 'primary' | 'secondary' | 'success' | 'error' = 'secondary';

                        if (selectedAnswer) {
                            if (isAnswerCorrect) {
                                variant = 'success';
                            } else if (isSelected) {
                                variant = 'error';
                            }
                        }

                        // Map A, B, C, D
                        const label = String.fromCharCode(65 + index); // 65 is 'A'

                        return (
                            <Animated.View
                                key={`${currentQuestionIndex}-${option}`}
                                entering={FadeInDown.delay(100 + (index * 50)).springify()}
                                style={{ width: '100%' }}
                            >
                                <GlassButton
                                    title={option.toUpperCase()} // Screenshot shows uppercase options
                                    label={label}
                                    onPress={() => handleAnswer(option)}
                                    style={styles.optionButton}
                                    variant={variant}
                                    disabled={selectedAnswer !== null}
                                />
                            </Animated.View>
                        );
                    })}
                </View>


            </View>

            {/* Answer Feedback Overlay */}
            <AnswerFeedbackOverlay
                type={answerFeedback}
                onAnimationEnd={() => { }}
            />

            {/* Explanation Modal/Overlay */}
            {showExplanation && (
                <View style={styles.explanationOverlay}>
                    <GlassContainer style={styles.explanationCard} intensity={80}>
                        <Text style={styles.explanationTitle}>Explanation</Text>
                        <Text style={styles.explanationTextNative}>
                            {currentQuestion?.explanation}
                        </Text>
                    </GlassContainer>
                </View>
            )}

            {/* Level Complete Celebration */}
            <LevelCompleteCelebration
                visible={showLevelComplete}
                stars={getStars()}
                score={score}
                correctAnswers={correctAnswers}
                totalQuestions={totalQuestions}
                onPlayAgain={handlePlayAgain}
                onGoToLevels={handleGoToLevels}
                onClose={() => setShowLevelComplete(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50, // More top padding for status bar
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 10,
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    streakText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    pointsText: {
        color: '#fbbf24',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },
    iconButton: {
        padding: 8,
        marginLeft: -8,
        zIndex: 10,
    },
    contentArea: {
        paddingHorizontal: 4,
        marginTop: 10,
        zIndex: 1,
    },
    questionCard: {
        padding: 24,
        borderRadius: 24,
        width: '100%',
    },
    // Explanation / Result Styles
    explanationOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 100,
    },
    explanationCard: {
        padding: 24,
        width: '100%',
        alignItems: 'center',
    },
    citationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    historyBadge: {
        backgroundColor: 'rgba(57, 255, 20, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(57, 255, 20, 0.4)',
    },
    historyText: {
        color: colors.accent,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    citationText: {
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        fontFamily: typography.fontFamily.serif,
        fontSize: 13,
    },
    questionContainer: {
        // Removed unnecessary margin
    },
    questionText: {
        color: '#FFF',
        fontSize: 24,
        lineHeight: 34,
        fontFamily: typography.fontFamily.serif,
        marginBottom: 16,
    },
    questionHighlight: {
        color: colors.accent,
        fontStyle: 'italic',
    },
    subText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        lineHeight: 22,
    },
    optionsArea: {
        gap: 12,
        marginTop: 24,
        paddingBottom: 40,
    },
    optionsList: {
        gap: 12,
    },
    optionButton: {
        width: '100%',
        justifyContent: 'flex-start', // Align left
    },


    explanationTitle: {
        color: colors.accent,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    explanationTextNative: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    // Result styles
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCard: {
        width: width - 40,
        alignItems: 'center',
        padding: 32,
    },
    trophyIcon: {
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 32,
        fontFamily: typography.fontFamily.bold,
        color: colors.card.text,
        marginBottom: 24,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statsContainer: {
        width: '100%',
        marginBottom: 32,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    statLabel: {
        color: colors.card.textSecondary,
        fontSize: 16,
    },
    statValue: {
        color: colors.card.text,
        fontSize: 18,
        fontFamily: typography.fontFamily.bold,
    },
    resultButtons: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    resultButton: {
        flex: 1,
    },
    // Feedback overlay styles
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    feedbackContainer: {
        alignItems: 'center',
        padding: 40,
        borderRadius: 30,
    },
    correctContainer: {
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 2,
        borderColor: colors.success,
    },
    wrongContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 2,
        borderColor: '#ef4444',
    },
    correctText: {
        fontSize: 32,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
        marginTop: 16,
    },
    wrongText: {
        fontSize: 32,
        fontFamily: typography.fontFamily.bold,
        color: '#ef4444',
        marginTop: 16,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
        gap: 8,
    },
    // Confetti styles
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 1,
    },
    confettiParticle: {
        position: 'absolute',
        width: 10,
        height: 20,
        borderRadius: 5,
        top: -20,
    },
    // Celebration overlay styles
    celebrationOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 300,
    },
    celebrationCard: {
        width: width - 40,
        maxWidth: 400,
    },
    celebrationContent: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 30,
    },
    trophyContainer: {
        marginBottom: 16,
    },
    celebrationTitle: {
        fontSize: 32,
        fontFamily: typography.fontFamily.bold,
        color: colors.card.text,
        marginBottom: 24,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    celebrationStats: {
        width: '100%',
        marginBottom: 24,
    },
    celebrationButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    celebrationButton: {
        flex: 1,
    },
});
