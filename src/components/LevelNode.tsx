import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
}

export const LevelNode: React.FC<LevelNodeProps> = ({
    levelNumber,
    title,
    status,
    stars = 0,
    onPress,
    color
}) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';

    return (
        <TouchableOpacity onPress={onPress} disabled={isLocked} activeOpacity={0.8} style={styles.wrapper}>
            <GlassContainer
                style={[
                    styles.container,
                    isLocked && styles.locked,
                    isCurrent && { borderColor: color, borderWidth: 2 }
                ]}
                intensity={isLocked ? 10 : 30}
            >
                <View style={[styles.iconContainer, { backgroundColor: isLocked ? 'rgba(255,255,255,0.1)' : color }]}>
                    {isCompleted ? (
                        <Check color="#FFF" size={20} />
                    ) : isLocked ? (
                        <Lock color="rgba(255,255,255,0.5)" size={20} />
                    ) : (
                        <Play color="#FFF" size={20} fill="#FFF" />
                    )}
                </View>
            </GlassContainer>
            <Text style={[styles.label, isLocked && styles.lockedLabel]}>{levelNumber}. {title}</Text>
            {isCompleted && stars > 0 && (
                <View style={styles.starsContainer}>
                    {[1, 2, 3].map((i) => (
                        <Star
                            key={i}
                            size={14}
                            color={i <= stars ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                            fill={i <= stars ? '#fbbf24' : 'transparent'}
                        />
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        width: 120,
    },
    container: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    locked: {
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: colors.card.text,
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.bold,
        textAlign: 'center',
    },
    lockedLabel: {
        color: colors.card.textSecondary,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
    },
});
