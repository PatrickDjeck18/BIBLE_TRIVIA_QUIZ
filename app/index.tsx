import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform, Dimensions } from 'react-native';
import { GlassContainer } from '../src/components/GlassContainer';
import { GlassButton } from '../src/components/GlassButton';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { useRouter } from 'expo-router';
import { useGame } from '../src/context/GameContext';
import { Trophy, Flame, Gift, Star, Sparkles, BookOpen } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import Animated, {
    FadeInDown,
    ZoomIn,
    FadeIn,
    SlideInUp,
    BounceIn,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    useAnimatedStyle,
    useSharedValue,
    Easing,
    FadeOut,
    SlideOutDown,
    withDelay
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Splash Screen Component with 5 second loading animation
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const progress = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Initial fade in
        opacity.value = withTiming(1, { duration: 500 });

        // Scale animation for logo
        scale.value = withSequence(
            withSpring(1.1, { damping: 8 }),
            withSpring(1, { damping: 12 })
        );

        // Rotation for the decorative element
        rotation.value = withRepeat(
            withTiming(360, { duration: 3000, easing: Easing.linear }),
            -1
        );

        // Progress bar animation over 5 seconds
        progress.value = withTiming(100, { duration: 5000 });

        // Auto finish after 5 seconds
        const timer = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 300 }, () => {
                onFinish();
            });
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value}%`
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const rotationStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${rotation.value}deg` }]
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    return (
        <Animated.View style={[styles.splashContainer, containerStyle]}>
            {/* Background decorative circles */}
            <Animated.View style={[styles.decorativeCircle, styles.circle1, rotationStyle]} />
            <Animated.View style={[styles.decorativeCircle, styles.circle2, rotationStyle]} />
            <Animated.View style={[styles.decorativeCircle, styles.circle3, rotationStyle]} />

            {/* Logo and Title */}
            <Animated.View style={[styles.splashContent, logoStyle]}>
                <Animated.View entering={BounceIn.delay(300)}>
                    <BookOpen color={colors.accent} size={80} />
                </Animated.View>

                <Animated.Text
                    entering={FadeInDown.delay(500)}
                    style={styles.splashTitle}
                >
                    Quiz Biblique
                </Animated.Text>


            </Animated.View>

            {/* Loading indicator */}
            <Animated.View entering={FadeInDown.delay(900)} style={styles.loadingContainer}>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, progressStyle]} />
                </View>
                <Animated.Text entering={FadeIn.delay(1000)} style={styles.loadingText}>
                    Chargement...
                </Animated.Text>
            </Animated.View>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <FloatingParticle key={i} delay={i * 300} index={i} />
            ))}
        </Animated.View>
    );
};

// Floating particle for splash screen
const FloatingParticle = ({ delay, index }: { delay: number; index: number }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    const positions = [
        { x: -100, y: -150 },
        { x: 100, y: -120 },
        { x: -120, y: 100 },
        { x: 120, y: 80 },
        { x: 0, y: -180 },
        { x: 80, y: 150 }
    ];

    useEffect(() => {
        const pos = positions[index % positions.length];

        opacity.value = withDelay(delay, withTiming(0.6, { duration: 500 }));
        translateX.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(pos.x + 20, { duration: 2000 + delay }),
                withTiming(pos.x - 20, { duration: 2000 + delay })
            ),
            -1,
            true
        ));
        translateY.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(pos.y + 20, { duration: 2500 + delay }),
                withTiming(pos.y - 20, { duration: 2500 + delay })
            ),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ],
        opacity: opacity.value
    }));

    return (
        <Animated.View style={[styles.particle, animatedStyle]}>
            <Star color={colors.accent} size={20 + (index * 4)} />
        </Animated.View>
    );
};

// Animated floating icon component
const FloatingIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1500 + delay, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 1500 + delay, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <Animated.View style={animatedStyle}>
            {children}
        </Animated.View>
    );
};

// Animated stat card component
const StatCard = ({
    icon,
    value,
    label,
    color,
    delay
}: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
    delay: number;
}) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).springify()}
            style={styles.statCard}
        >
            <FloatingIcon delay={delay}>
                {icon}
            </FloatingIcon>
            <Animated.Text
                entering={ZoomIn.delay(delay + 100).springify()}
                style={[styles.statValue, { color }]}
            >
                {value}
            </Animated.Text>
            <Animated.Text
                entering={FadeInDown.delay(delay + 200)}
                style={styles.statLabel}
            >
                {label}
            </Animated.Text>
        </Animated.View>
    );
};

export default function Home() {
    const router = useRouter();
    const { state, claimDailyReward } = useGame();
    const [showReward, setShowReward] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

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

    // Responsive breakpoints
    const isSmallDevice = width < 375;
    const isMediumDevice = width >= 375 && width < 768;
    const isLargeScreen = width >= 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    // Dynamic sizing based on screen size
    const titleFontSize = isSmallDevice ? 24 : isLargeScreen ? 48 : 32;
    const subtitleFontSize = isSmallDevice ? 14 : isLargeScreen ? 24 : 18;
    const buttonWidth = isLargeScreen ? 300 : '100%';
    const contentMaxWidth = isDesktop ? 600 : isTablet ? 500 : '100%';
    const statsGap = isSmallDevice ? 12 : 24;
    const containerPadding = isSmallDevice ? 12 : isLargeScreen ? 40 : 20;

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingBottom: insets.bottom + 20,
                        paddingHorizontal: containerPadding
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[
                    styles.contentWrapper,
                    { maxWidth: contentMaxWidth }
                ]}>
                    {/* Daily Reward Banner */}
                    {!state.dailyRewardClaimed && (
                        <Animated.View
                            entering={FadeInDown.springify()}
                            style={styles.rewardBanner}
                        >
                            <GlassContainer style={styles.rewardBannerContent} intensity={30}>
                                <Animated.View entering={BounceIn.delay(300)}>
                                    <Gift color={colors.accent} size={isSmallDevice ? 20 : 24} />
                                </Animated.View>
                                <Text style={[
                                    styles.rewardText,
                                    { fontSize: isSmallDevice ? 12 : 14 }
                                ]}>
                                    Récompense quotidienne disponible!
                                </Text>
                                <GlassButton
                                    title="Réclamer"
                                    onPress={handleDailyReward}
                                    variant="primary"
                                    style={[styles.claimButton, {
                                        paddingVertical: isSmallDevice ? 6 : 8,
                                        paddingHorizontal: isSmallDevice ? 12 : 16
                                    }]}
                                />
                            </GlassContainer>
                        </Animated.View>
                    )}

                    <GlassContainer style={[
                        styles.glass,
                        {
                            paddingVertical: isLargeScreen ? 60 : 40,
                            paddingHorizontal: isSmallDevice ? 16 : 24
                        }
                    ]}>
                        {/* Animated Title */}
                        <Animated.View
                            entering={FadeInDown.delay(100).springify()}
                            style={styles.titleContainer}
                        >
                            <FloatingIcon>
                                <BookOpen color={colors.accent} size={isSmallDevice ? 28 : isLargeScreen ? 44 : 36} />
                            </FloatingIcon>
                            <Text style={[
                                styles.title,
                                { fontSize: titleFontSize }
                            ]}>
                                Quiz Biblique
                            </Text>
                        </Animated.View>



                        {/* Stats Section */}
                        <Animated.View
                            entering={SlideInUp.delay(300).springify()}
                            style={[styles.statsSection, { gap: statsGap }]}
                        >
                            <StatCard
                                icon={<Trophy color={colors.accent} size={isSmallDevice ? 20 : 24} />}
                                value={state.totalPoints}
                                label="Points"
                                color={colors.card.text}
                                delay={400}
                            />
                            <StatCard
                                icon={<Flame color="#f97316" size={isSmallDevice ? 20 : 24} />}
                                value={state.currentStreak}
                                label="Série"
                                color="#f97316"
                                delay={500}
                            />
                            <StatCard
                                icon={<Star color="#fbbf24" size={isSmallDevice ? 20 : 24} />}
                                value={completedLevels}
                                label="Niveaux"
                                color="#fbbf24"
                                delay={600}
                            />
                        </Animated.View>

                        {/* Accuracy Display */}
                        <Animated.View
                            entering={FadeInDown.delay(700)}
                            style={styles.accuracyContainer}
                        >
                            <Text style={[
                                styles.accuracyLabel,
                                { fontSize: isSmallDevice ? 12 : 14 }
                            ]}>
                                Précision
                            </Text>
                            <Animated.View
                                entering={ZoomIn.delay(800)}
                                style={styles.accuracyBadge}
                            >
                                <Text style={[
                                    styles.accuracyValue,
                                    { fontSize: isSmallDevice ? 16 : 18 }
                                ]}>
                                    {accuracy}%
                                </Text>
                            </Animated.View>
                        </Animated.View>

                        {/* Buttons */}
                        <Animated.View
                            entering={SlideInUp.delay(900).springify()}
                            style={[styles.buttonContainer, { maxWidth: buttonWidth }]}
                        >
                            <GlassButton
                                title="Commencer"
                                onPress={() => router.push('/levels')}
                                variant="primary"
                                style={[
                                    styles.mainButton,
                                    {
                                        paddingVertical: isSmallDevice ? 14 : 18,
                                        marginBottom: 12
                                    }
                                ]}
                            />
                            <GlassButton
                                title="Paramètres"
                                onPress={() => router.push('/settings')}
                                variant="secondary"
                                style={[
                                    styles.mainButton,
                                    { paddingVertical: isSmallDevice ? 12 : 16 }
                                ]}
                            />
                        </Animated.View>
                    </GlassContainer>

                    {/* Footer info for larger screens */}
                    {isLargeScreen && (
                        <Animated.View
                            entering={FadeIn.delay(1000)}
                            style={styles.footerInfo}
                        >
                            <Text style={styles.footerText}>
                                Testez vos connaissances bibliques à travers des quiz interactifs
                            </Text>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            {/* Reward Animation */}
            {showReward && (
                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={FadeIn.delay(2500)}
                    style={styles.rewardPopup}
                >
                    <GlassContainer style={[
                        styles.rewardPopupContent,
                        {
                            padding: isSmallDevice ? 20 : 24,
                            borderRadius: isLargeScreen ? 30 : 20
                        }
                    ]} intensity={50}>
                        <Animated.View entering={BounceIn.delay(200)}>
                            <Star color={colors.accent} size={isSmallDevice ? 36 : 48} fill={colors.accent} />
                        </Animated.View>
                        <Animated.Text
                            entering={ZoomIn.delay(400)}
                            style={[
                                styles.rewardAmount,
                                { fontSize: isSmallDevice ? 28 : 36 }
                            ]}
                        >
                            +{rewardAmount}
                        </Animated.Text>
                        <Animated.Text
                            entering={FadeInDown.delay(600)}
                            style={styles.rewardLabel}
                        >
                            points!
                        </Animated.Text>
                    </GlassContainer>
                </Animated.View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    // Splash Screen Styles
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    splashContent: {
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
    },
    splashTitle: {
        fontSize: 42,
        fontFamily: typography.fontFamily.bold,
        color: colors.card.text,
        textAlign: 'center',
    },

    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
        gap: 16,
    },
    progressBarBg: {
        width: 200,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 3,
    },
    loadingText: {
        color: colors.card.textSecondary,
        fontSize: 14,
    },
    decorativeCircle: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    circle1: {
        top: -100,
        right: -100,
    },
    circle2: {
        bottom: -50,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    circle3: {
        top: '30%',
        left: '20%',
        width: 400,
        height: 400,
        borderRadius: 200,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    particle: {
        position: 'absolute',
    },
    // Home Screen Styles
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    contentWrapper: {
        width: '100%',
        alignSelf: 'center',
        gap: 20,
    },
    rewardBanner: {
        width: '100%',
        zIndex: 10,
    },
    rewardBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        flexWrap: 'wrap',
    },
    rewardText: {
        flex: 1,
        color: colors.card.text,
        minWidth: 150,
    },
    claimButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    rewardPopup: {
        position: 'absolute',
        top: '30%',
        alignSelf: 'center',
        zIndex: 100,
    },
    rewardPopupContent: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
    },
    rewardAmount: {
        fontFamily: typography.fontFamily.bold,
        color: colors.accent,
        marginTop: 8,
    },
    rewardLabel: {
        fontSize: 18,
        color: colors.card.text,
    },
    titleContainer: {
        alignItems: 'center',
        gap: 8,
    },
    glass: {
        width: '100%',
        alignItems: 'center',
        gap: 24,
    },
    title: {
        fontFamily: typography.fontFamily.bold,
        color: colors.card.text,
        textAlign: 'center',
    },

    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    statCard: {
        alignItems: 'center',
        gap: 4,
        minWidth: 80,
    },
    statValue: {
        fontSize: 24,
        fontFamily: typography.fontFamily.bold,
    },
    statLabel: {
        fontSize: 12,
        color: colors.card.textSecondary,
    },
    accuracyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    accuracyLabel: {
        color: colors.card.textSecondary,
    },
    accuracyBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    accuracyValue: {
        fontFamily: typography.fontFamily.bold,
        color: colors.accent,
    },
    buttonContainer: {
        width: '100%',
        gap: 8,
        paddingHorizontal: 20,
    },
    mainButton: {
        width: '100%',
    },
    footerInfo: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        color: colors.card.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
