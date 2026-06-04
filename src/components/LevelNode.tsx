import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer } from './GlassContainer';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Check, Lock, Play, Star } from 'lucide-react-native';

interface LevelNodeProps {
    levelNumber: number;
    title: string;
    status: 'locked' | 'current' | 'completed';
    stars?: number;
    onPress: () => void;
    color: string;
    delay?: number;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
    levelNumber,
    title,
    status,
    stars = 0,
    onPress,
    color,
    delay = 0,
}) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';

    const scale = useSharedValue(0.6);
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
        // Entrance animation
        scale.value = withDelay(delay, withSpring(1, { damping: 10, stiffness: 120 }));

        // Pulse glow for current level
        if (isCurrent) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.25, { duration: 900 }),
                    withTiming(1, { duration: 900 }),
                ),
                -1, true
            );
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0, { duration: 900 }),
                    withTiming(0.5, { duration: 900 }),
                ),
                -1, true
            );
        }
    }, [status]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const nodeColor = isLocked ? 'rgba(15,23,42,0.08)' : color;

    return (
        <Animated.View style={[styles.wrapper, containerStyle]}>
            <TouchableOpacity onPress={onPress} disabled={isLocked} activeOpacity={0.8} style={styles.touchable}>
                {/* Pulse ring for current level */}
                {isCurrent && (
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            { borderColor: color, width: 96, height: 96, borderRadius: 48 },
                            pulseStyle,
                        ]}
                    />
                )}

                {/* Node circle */}
                {isCompleted ? (
                    <LinearGradient
                        colors={[color, `${color}BB`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.node, styles.nodeShadow, { shadowColor: color }]}
                    >
                        <Check color="#FFF" size={28} strokeWidth={3} />
                    </LinearGradient>
                ) : isCurrent ? (
                    <LinearGradient
                        colors={[color, `${color}99`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.node, styles.nodeShadow, { shadowColor: color, borderWidth: 2, borderColor: '#FFF' }]}
                    >
                        <Play color="#FFF" size={26} fill="#FFF" />
                    </LinearGradient>
                ) : (
                    <View style={[styles.node, styles.nodeLocked]}>
                        <Lock color="rgba(15,23,42,0.3)" size={22} />
                    </View>
                )}

                {/* Level number badge */}
                <View style={[styles.levelBadge, { backgroundColor: isLocked ? '#F8FAFC' : '#FFFFFF' }]}>
                    <Text style={[styles.levelNumber, { color: isLocked ? colors.card.textMuted : color }]}>
                        {levelNumber}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Title */}
            <Text style={[styles.label, isLocked && styles.lockedLabel]} numberOfLines={2}>
                {title}
            </Text>

            {/* Stars */}
            {isCompleted && (
                <View style={styles.starsContainer}>
                    {[1, 2, 3].map((i) => (
                        <Star
                            key={i}
                            size={14}
                            color={i <= stars ? colors.gold : 'rgba(15,23,42,0.15)'}
                            fill={i <= stars ? colors.gold : 'transparent'}
                        />
                    ))}
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        width: 130,
    },
    touchable: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    node: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nodeLocked: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    nodeShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    pulseRing: {
        position: 'absolute',
        borderWidth: 2,
    },
    levelBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    levelNumber: {
        fontSize: 9,
        fontFamily: typography.fontFamily.bold,
    },
    label: {
        color: colors.card.text,
        fontSize: 11,
        fontFamily: typography.fontFamily.bold,
        textAlign: 'center',
        maxWidth: 110,
        lineHeight: 15,
    },
    lockedLabel: {
        color: colors.card.textMuted,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 3,
        marginTop: 4,
    },
});
