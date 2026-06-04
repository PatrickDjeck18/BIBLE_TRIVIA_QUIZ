import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface OrbProps {
    size: number;
    color: string;
    x: number;
    y: number;
    delay: number;
    duration: number;
}

const Orb: React.FC<OrbProps> = ({ size, color, x, y, delay, duration }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 0 });
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.orb,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    left: x,
                    top: y,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.1,
                    shadowRadius: size * 0.4,
                },
                animStyle,
            ]}
        />
    );
};

interface AnimatedBackgroundProps {
    children: React.ReactNode;
    variant?: 'home' | 'quiz' | 'levels';
}

const ORB_CONFIGS: Record<string, OrbProps[]> = {
    home: [
        { size: 500, color: 'rgba(13, 71, 161, 0.25)', x: -100, y: -100, delay: 0, duration: 10000 },
        { size: 300, color: 'rgba(255, 202, 40, 0.1)', x: width - 200, y: height * 0.2, delay: 400, duration: 12000 },
        { size: 200, color: 'rgba(13, 71, 161, 0.2)', x: 0, y: height * 0.6, delay: 800, duration: 9000 },
    ],
    quiz: [
        { size: 600, color: 'rgba(13, 71, 161, 0.25)', x: -width / 2 + 50, y: -200, delay: 0, duration: 12000 },
        { size: 250, color: 'rgba(255, 202, 40, 0.1)', x: width - 150, y: height * 0.5, delay: 300, duration: 8000 },
    ],
    levels: [
        { size: 400, color: 'rgba(13, 71, 161, 0.3)', x: -50, y: -50, delay: 0, duration: 8000 },
        { size: 200, color: 'rgba(255, 202, 40, 0.1)', x: width - 100, y: height * 0.4, delay: 500, duration: 10000 },
    ],
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    children,
    variant = 'home',
}) => {
    const orbs = ORB_CONFIGS[variant] || ORB_CONFIGS.home;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#001A66', '#020617']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Grid pattern */}
            <View style={styles.grid} pointerEvents="none" />

            {/* Orbs */}
            {orbs.map((orb, i) => (
                <Orb key={i} {...orb} />
            ))}

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    grid: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        // Subtle grid overlay via opacity only (gradient lines would need SVG)
        backgroundColor: 'transparent',
    },
    orb: {
        position: 'absolute',
        // elevation for Android glow effect
        elevation: 0,
    },
    content: {
        flex: 1,
        zIndex: 10,
    },
});
