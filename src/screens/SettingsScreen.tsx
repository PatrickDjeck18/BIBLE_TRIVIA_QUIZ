import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Linking, Share, Platform } from 'react-native';
import { GlassContainer } from '../components/GlassContainer';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    ChevronRight,
    Bell,
    Volume2,
    Vibrate,
    Moon,
    Globe,
    Shield,
    FileText,
    Star,
    Share2,
    Mail,
    Info,
    Headphones,
    Trash2,
} from 'lucide-react-native';
import { useGame } from '../context/GameContext';

interface SettingRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (val: boolean) => void;
    danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
    icon,
    label,
    value,
    onPress,
    isToggle,
    toggleValue,
    onToggle,
    danger,
}) => {
    return (
        <TouchableOpacity
            style={styles.settingRow}
            onPress={onPress}
            disabled={isToggle}
            activeOpacity={0.7}
        >
            <View style={styles.settingRowLeft}>
                <View style={[styles.iconWrapper, danger && styles.iconWrapperDanger]}>
                    {icon}
                </View>
                <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
            </View>
            <View style={styles.settingRowRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                {isToggle && onToggle ? (
                    <Switch
                        value={toggleValue}
                        onValueChange={onToggle}
                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(92, 179, 56, 0.4)' }}
                        thumbColor={toggleValue ? colors.accent : '#555'}
                    />
                ) : (
                    !isToggle && <ChevronRight color={colors.card.textSecondary} size={20} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const router = useRouter();
    const { state, resetProgress } = useGame();

    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);
    const [vibration, setVibration] = useState(true);

    const handleRateApp = () => {
        const androidPackageName = 'com.quiz.biblique.app';
        const iosAppId = '6759291543';

        if (Platform.OS === 'android') {
            Linking.openURL(`market://details?id=${androidPackageName}`);
        } else {
            Linking.openURL(`https://apps.apple.com/app/id${iosAppId}?action=write-review`);
        }
    };

    const handleShare = async () => {
        const androidLink = 'https://play.google.com/store/apps/details?id=com.quiz.biblique.app';
        const iosLink = 'https://apps.apple.com/app/id6759291543';

        const message = Platform.OS === 'ios'
            ? 'Découvrez Quiz Biblique ! Testez vos connaissances bibliques.'
            : `Découvrez Quiz Biblique ! Testez vos connaissances bibliques.\n\nAndroid: ${androidLink}\niOS: ${iosLink}`;

        try {
            await Share.share({
                message,
                url: Platform.OS === 'ios' ? iosLink : undefined, // iOS supports a separate url field
                title: 'Quiz Biblique'
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleContact = () => {
        Linking.openURL('mailto:support@dailyfaith.me');
    };

    const handleResetProgress = () => {
        // Could add confirmation dialog here
        resetProgress();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.card.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Paramètres</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Notifications Section */}
                <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
                <GlassContainer style={styles.section}>
                    <SettingRow
                        icon={<Bell color={colors.accent} size={20} />}
                        label="Notifications"
                        isToggle
                        toggleValue={notifications}
                        onToggle={setNotifications}
                    />
                </GlassContainer>

                {/* Legal Section */}
                <Text style={styles.sectionHeader}>LÉGAL</Text>
                <GlassContainer style={styles.section}>
                    <SettingRow
                        icon={<Shield color={colors.accent} size={20} />}
                        label="Politique de confidentialité"
                        onPress={() => router.push('/privacy')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<FileText color={colors.accent} size={20} />}
                        label="Conditions d'utilisation"
                        onPress={() => router.push('/terms')}
                    />
                </GlassContainer>

                {/* Support Section */}
                <Text style={styles.sectionHeader}>SUPPORT</Text>
                <GlassContainer style={styles.section}>
                    <SettingRow
                        icon={<Star color={colors.accent} size={20} />}
                        label="Noter l'application"
                        onPress={handleRateApp}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Share2 color={colors.accent} size={20} />}
                        label="Partager l'application"
                        onPress={handleShare}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Mail color={colors.accent} size={20} />}
                        label="Nous contacter"
                        onPress={handleContact}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Headphones color={colors.accent} size={20} />}
                        label="Centre d'aide"
                        onPress={() => router.push('/support')}
                    />
                </GlassContainer>

                {/* Danger Zone */}
                <Text style={styles.sectionHeader}>DONNÉES</Text>
                <GlassContainer style={styles.section}>
                    <SettingRow
                        icon={<Trash2 color={colors.error} size={20} />}
                        label="Réinitialiser la progression"
                        onPress={handleResetProgress}
                        danger
                    />
                </GlassContainer>

                {/* About */}
                <GlassContainer style={[styles.section, styles.aboutSection]}>
                    <View style={styles.aboutRow}>
                        <Info color={colors.card.textSecondary} size={16} />
                        <Text style={styles.aboutText}>Quiz Biblique v1.2.8</Text>
                    </View>
                    <Text style={styles.aboutSubtext}>
                        Développé avec ❤️ pour la gloire de Dieu
                    </Text>
                </GlassContainer>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        color: colors.card.text,
        fontSize: 24,
        fontFamily: typography.fontFamily.bold,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    sectionHeader: {
        color: colors.card.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: 1.5,
        marginBottom: 8,
        marginTop: 20,
        marginLeft: 4,
    },
    section: {
        padding: 4,
        marginBottom: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    settingRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(92, 179, 56, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    iconWrapperDanger: {
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
    },
    settingLabel: {
        color: colors.card.text,
        fontSize: 16,
        fontFamily: typography.fontFamily.medium,
    },
    settingValue: {
        color: colors.card.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.regular,
    },
    dangerText: {
        color: colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: colors.card.border,
        marginLeft: 62,
    },
    aboutSection: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
    },
    aboutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    aboutText: {
        color: colors.card.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.medium,
    },
    aboutSubtext: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontFamily: typography.fontFamily.regular,
        marginTop: 4,
    },
});
