import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface GlassContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number; // kept for backward-compat
    variant?: 'default' | 'elevated' | 'gold' | 'success' | 'error';
    gradient?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
    children,
    style,
    variant = 'default',
    gradient = false,
}) => {
    const borderColor =
        variant === 'gold' ? colors.card.borderGold :
            variant === 'success' ? colors.success :
                variant === 'error' ? colors.error :
                    variant === 'elevated' ? 'rgba(255, 202, 40, 0.15)' :
                        colors.card.border;

    const bgColor =
        variant === 'elevated' ? colors.card.backgroundElevated :
            colors.card.background;

    if (gradient) {
        return (
            <LinearGradient
                colors={['rgba(13, 71, 161, 0.3)', 'rgba(8, 33, 97, 0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.container, variant === 'elevated' && styles.elevated, { borderColor }, style]}
            >
                {children}
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.container, variant === 'elevated' && styles.elevated, { backgroundColor: bgColor, borderColor }, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderColor: colors.card.border,
        borderWidth: 1,
        borderRadius: 20,
        overflow: 'hidden',
        padding: 16,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    }
});
