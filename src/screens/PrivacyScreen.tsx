import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';

const LAST_UPDATED = 'February 17, 2026';

const sections = [
    {
        title: '1. Introduction',
        content:
            'Bible Quiz ("we", "our", "the App") is committed to protecting your privacy. This privacy policy explains how we collect, use, and protect your information when you use our mobile application.',
    },
    {
        title: '2. Information Collected',
        content:
            "We collect the following types of information:\n\n• Progression Data: Your scores, completed levels, streaks, and game statistics are stored locally on your device.\n\n• Usage Data: We may collect anonymous data on how you use the app (frequency of use, features used) to improve our service.\n\n• Device Identifiers: We may collect anonymous device identifiers for analysis purposes.",
    },
    {
        title: '3. Use of Information',
        content:
            "We use your information to:\n\n• Provide and maintain the app\n• Save your game progress\n• Improve the user experience\n• Analyze usage trends\n• Communicate important updates",
    },
    {
        title: '4. Data Storage',
        content:
            'Your progression data is stored locally on your device using AsyncStorage. We do not transfer this data to external servers without your explicit consent.',
    },
    {
        title: '5. Third-Party Services',
        content:
            "The App may use third-party services that collect information used to identify you. These services include:\n\n• Expo / React Native (app infrastructure)\n• Anonymous analysis services\n\nEach of these services has its own privacy policy regarding data processing.",
    },
    {
        title: '6. Security',
        content:
            'We take the security of your data seriously. While no method of transmission over the Internet or electronic storage is 100% secure, we strive to use commercially acceptable means to protect your information.',
    },
    {
        title: '7. User Rights',
        content:
            'You have the right to:\n\n• Access your personal data\n• Request the deletion of your data\n• Reset your progress at any time via the settings\n• Disable notifications',
    },
    {
        title: '8. Children',
        content:
            'Our app is suitable for all ages. We do not knowingly collect personal information from children under 13 without parental consent.',
    },
    {
        title: '9. Changes',
        content:
            "We may update this privacy policy from time to time. We will inform you of any changes by posting the new policy in the app. We advise you to check this page regularly.",
    },
    {
        title: '10. Contact',
        content:
            'If you have any questions regarding this privacy policy, please contact us at:\n\nsupport@dailyfaith.me',
    },
];

export default function PrivacyScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.backButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft color={colors.card.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Badge */}
                <View style={styles.heroBadge}>
                    <View style={styles.heroIcon}>
                        <Shield color={colors.accent} size={28} />
                    </View>
                    <Text style={styles.heroTitle}>Privacy Policy</Text>
                    <Text style={styles.heroDate}>Last updated: {LAST_UPDATED}</Text>
                </View>

                {/* Sections */}
                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

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
        zIndex: 50,
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
        paddingTop: 16,
    },
    heroBadge: {
        alignItems: 'center',
        marginBottom: 32,
        paddingVertical: 24,
        backgroundColor: colors.card.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.card.border,
    },
    heroIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(92, 179, 56, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    heroTitle: {
        color: colors.card.text,
        fontSize: 20,
        fontFamily: typography.fontFamily.bold,
        marginBottom: 4,
    },
    heroDate: {
        color: colors.card.textSecondary,
        fontSize: 13,
        fontFamily: typography.fontFamily.regular,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: colors.accent,
        fontSize: 17,
        fontFamily: typography.fontFamily.bold,
        marginBottom: 10,
    },
    sectionContent: {
        color: colors.card.textSecondary,
        fontSize: 15,
        fontFamily: typography.fontFamily.regular,
        lineHeight: 24,
    },
});
