import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
    icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const LAYOUT_PROPERTIES = [
    'position', 'top', 'bottom', 'left', 'right',
    'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'alignSelf', 'margin', 'marginTop', 'marginBottom',
    'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'zIndex', 'aspectRatio', 'transform'
];

const getLayoutStyles = (style: any) => {
    if (!style) return {};
    const flattened = StyleSheet.flatten(style);
    const layoutStyle: any = {};
    LAYOUT_PROPERTIES.forEach(prop => {
        if (flattened[prop] !== undefined) {
            layoutStyle[prop] = flattened[prop];
        }
    });
    return layoutStyle;
};

const getNonLayoutStyles = (style: any) => {
    if (!style) return {};
    const flattened = StyleSheet.flatten(style);
    const nonLayoutStyle: any = { ...flattened };
    LAYOUT_PROPERTIES.forEach(prop => {
        delete nonLayoutStyle[prop];
    });
    return nonLayoutStyle;
};

export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'primary',
    disabled = false,
    label,
    icon,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    };

    const isPrimary = variant === 'primary';
    const isSuccess = variant === 'success';
    const isError = variant === 'error';
    const isSecondary = variant === 'secondary';

    const labelActive = isSuccess;

    const layoutStyle = getLayoutStyles(style);
    const nonLayoutStyle = getNonLayoutStyles(style);

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            disabled={disabled}
            style={[animatedStyle, disabled && styles.disabled, layoutStyle]}
        >
            {isPrimary ? (
                <LinearGradient
                    colors={[colors.accentLight, colors.accent, '#3D9B20']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.container, styles.primaryGradient, nonLayoutStyle]}
                >
                    <ButtonContent label={label} title={title} icon={icon} textStyle={[styles.primaryText, textStyle]} labelActive={false} />
                </LinearGradient>
            ) : isSuccess ? (
                <LinearGradient
                    colors={[colors.success, '#22C55E', '#16A34A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.container, nonLayoutStyle]}
                >
                    <ButtonContent label={label} title={title} icon={icon} textStyle={[styles.successText, textStyle]} labelActive />
                </LinearGradient>
            ) : isError ? (
                <View style={[styles.container, styles.errorBorder, nonLayoutStyle]}>
                    <ButtonContent label={label} title={title} icon={icon} textStyle={[styles.errorText, textStyle]} labelActive={false} />
                </View>
            ) : (
                // secondary (default quiz option usually)
                <LinearGradient
                    colors={[colors.gradient.start, colors.gradient.end]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.container, styles.secondaryBorder, nonLayoutStyle]}
                >
                    <ButtonContent label={label} title={title} icon={icon} textStyle={[styles.secondaryText, textStyle]} labelActive={false} />
                </LinearGradient>
            )}
        </AnimatedTouchable>
    );
};

const ButtonContent = ({
    label,
    title,
    icon,
    textStyle,
    labelActive,
}: {
    label?: string;
    title: string;
    icon?: React.ReactNode;
    textStyle?: StyleProp<TextStyle>;
    labelActive: boolean;
}) => (
    <View style={styles.innerContent}>
        {label && (
            <Text style={[styles.labelText, labelActive && styles.labelTextActive]}>{label}:</Text>
        )}
        <View style={[styles.contentContainer, label ? styles.contentAlignLeft : null]}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, textStyle]} numberOfLines={2}>
                {title}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30, // capsule pill shape
        flexDirection: 'row',
    },
    innerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    primaryGradient: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 2,
        borderColor: colors.card.borderGold,
    },
    secondaryBorder: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 3,
        borderColor: colors.card.borderGold,
    },
    errorBorder: {
        backgroundColor: colors.errorDim,
        borderWidth: 3,
        borderColor: colors.error,
    },
    text: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.h4,
        fontFamily: typography.fontFamily.bold,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    primaryText: {
        color: '#FFFFFF',
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.h4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    successText: {
        color: '#FFFFFF',
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.h4,
    },
    errorText: {
        color: colors.error,
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.h4,
    },
    secondaryText: {
        color: '#FFFFFF',
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.h4,
    },
    disabled: {
        opacity: 0.7,
    },
    labelText: {
        color: colors.goldLight, // Bright gold A, B, C
        fontFamily: typography.fontFamily.bold,
        fontSize: 22,
        marginRight: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
    },
    labelTextActive: {
        color: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    contentAlignLeft: {
        justifyContent: 'flex-start',
    },
    iconContainer: {
        marginRight: 4,
    },
});
