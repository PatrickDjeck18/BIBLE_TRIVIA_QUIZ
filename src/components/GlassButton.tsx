import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    variant?: 'primary' | 'secondary' | 'success' | 'error';
    disabled?: boolean;
    label?: string; // e.g. "A", "B", "C"
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'primary',
    disabled = false,
    label
}) => {
    const isPrimary = variant === 'primary';
    const isSuccess = variant === 'success';
    const isError = variant === 'error';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
            style={disabled && styles.disabled}
        >
            <View
                style={[
                    styles.container,
                    isPrimary && styles.primaryBorder,
                    isSuccess && styles.successBorder,
                    isError && styles.errorBorder,
                    style
                ]}
            >
                {label && (
                    <View style={[
                        styles.labelContainer,
                        isSuccess && styles.labelContainerActive
                    ]}>
                        <Text style={[
                            styles.labelText,
                            isSuccess && styles.labelTextActive
                        ]}>{label}</Text>
                    </View>
                )}

                <View style={[styles.contentContainer, label ? styles.contentAlignLeft : null]}>
                    <Text style={[
                        styles.text,
                        isPrimary && styles.primaryText,
                        isSuccess && styles.successText,
                        isError && styles.errorText,
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        flexDirection: 'row',
        backgroundColor: colors.card.background,
        borderWidth: 1,
        borderColor: colors.card.border,
    },
    primaryBorder: {
        borderColor: colors.accent,
        borderWidth: 1,
        backgroundColor: 'rgba(92, 179, 56, 0.1)', // Green tint
    },
    successBorder: {
        borderColor: colors.accent,
        borderWidth: 0,
        backgroundColor: colors.accent, // Solid green fill for correct/selected
    },
    errorBorder: {
        borderColor: colors.error,
        borderWidth: 1,
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
    },
    text: {
        color: colors.card.text,
        fontSize: typography.fontSize.body,
        fontFamily: typography.fontFamily.medium,
    },
    primaryText: {
        color: colors.accent,
        fontFamily: typography.fontFamily.bold,
    },
    successText: {
        color: '#000000', // Black text on green background
        fontFamily: typography.fontFamily.bold,
    },
    errorText: {
        color: colors.error,
        fontFamily: typography.fontFamily.bold,
    },
    disabled: {
        opacity: 0.5,
    },
    // Label styles
    labelContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)'
    },
    labelContainerActive: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderColor: 'rgba(0,0,0,0.3)',
    },
    labelText: {
        color: colors.card.text,
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: typography.fontFamily.bold,
    },
    labelTextActive: {
        color: '#000000',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
    contentAlignLeft: {
        alignItems: 'flex-start',
    }
});
