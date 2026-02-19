import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CardContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number; // kept for backward-compat, ignored
}

export const GlassContainer: React.FC<CardContainerProps> = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card.background,
        borderColor: colors.card.border,
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
        padding: 16,
    },
});
