import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { GlassContainer } from '../components/GlassContainer';
import { LevelNode } from '../components/LevelNode';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import { levels } from '../data/questions';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { useAds } from '../context/AdContext';

const { width } = Dimensions.get('window');

export default function LevelSelectionScreen() {
    const router = useRouter();
    const { state, getLevelProgress, isLevelUnlocked } = useGame();
    const { showInterstitial } = useAds();

    const getLevelStatus = (levelId: string, index: number): 'completed' | 'current' | 'locked' => {
        const progress = getLevelProgress(levelId);
        if (progress?.completed) return 'completed';
        if (isLevelUnlocked(levelId)) return 'current';
        return 'locked';
    };

    const handleBack = () => {
        showInterstitial(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/');
            }
        });
    };

    const completedCount = Object.values(state.levelsProgress).filter(l => l.completed).length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft color={colors.card.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Voyage Biblique</Text>
                <View style={styles.progressBadge}>
                    <Trophy color={colors.accent} size={18} />
                    <Text style={styles.progressText}>{completedCount}/{levels.length}</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.pathContainer}>
                    {levels.map((level, index) => {
                        const status = getLevelStatus(level.id, index);
                        const alignLeft = index % 2 === 0;
                        const progress = getLevelProgress(level.id);

                        return (
                            <Animated.View
                                key={level.id}
                                entering={FadeInDown.delay(index * 50).springify()}
                                style={styles.levelRow}
                            >
                                {/* Central Timeline Line */}
                                {index < levels.length - 1 && (
                                    <View style={[
                                        styles.centralLine,
                                        status === 'completed' && styles.centralLineCompleted
                                    ]} />
                                )}

                                <View style={[
                                    styles.nodeWrapper,
                                    alignLeft ? styles.alignRight : styles.alignLeft
                                ]}>
                                    <LevelNode
                                        levelNumber={index + 1}
                                        title={level.title}
                                        status={status}
                                        stars={progress?.stars || 0}
                                        onPress={() => {
                                            if (status !== 'locked') {
                                                router.push({ pathname: '/quiz', params: { levelId: level.id } });
                                            }
                                        }}
                                        color={level.color}
                                    />
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
        zIndex: 100, // High z-index to sit above scroll view
        position: 'relative',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
        zIndex: 101, // Ensure button is top-most
    },
    headerTitle: {
        flex: 1,
        color: colors.card.text,
        fontSize: typography.fontSize.h2,
        fontFamily: typography.fontFamily.bold,
    },
    progressBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(57, 255, 20, 0.2)', // Updated to neon green tint
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    progressText: {
        color: colors.accent,
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: 20,
    },
    pathContainer: {
        alignItems: 'center',
        width: '100%',
    },
    levelRow: {
        width: width,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -20,
    },
    centralLine: {
        position: 'absolute',
        width: 4,
        height: 140,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: 40,
        zIndex: -1,
    },
    centralLineCompleted: {
        backgroundColor: colors.accent,
    },
    nodeWrapper: {
        width: 300,
        alignItems: 'center',
    },
    alignLeft: {
        alignItems: 'flex-start',
        paddingLeft: 20,
    },
    alignRight: {
        alignItems: 'flex-end',
        paddingRight: 20,
    }
});
