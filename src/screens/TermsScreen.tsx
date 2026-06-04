import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';

const LAST_UPDATED = 'February 17, 2026';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content:
            'By downloading, installing, or using the Bible Quiz app ("the App"), you agree to be bound by these terms of service. If you do not accept these terms, please do not use the App.',
    },
    {
        title: '2. Description of Service',
        content:
            'Bible Quiz is an educational and fun quiz application based on the Bible. The App offers questions on different books of the Bible, a level-based progression system, daily rewards, and personal statistics tracking.',
    },
    {
        title: '3. Use of the App',
        content:
            "You commit to:\n\n• Using the App in a respectful manner and in accordance with its educational purpose\n• Not attempting to modify, decompile, or disassemble the App\n• Not using the App for commercial purposes without authorization\n• Not bypassing the security measures of the App",
    },
    {
        title: '4. App Content',
        content:
            "The questions, answers, and explanations provided in the App are based on the Bible and are intended for educational purposes. We strive to provide accurate information, but we do not guarantee the total absence of errors.\n\nThe content does not constitute official theological teaching and does not replace personal Bible study.",
    },
    {
        title: '5. Intellectual Property',
        content:
            'All elements of the App (design, code, content, graphics, logos) are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written authorization.',
    },
    {
        title: '6. Progression and Data',
        content:
            "Your game progression is stored locally on your device. We are not responsible for data loss resulting from:\n\n• Uninstalling the App\n• Changing devices\n• Resetting the device\n• Technical errors beyond our control",
    },
    {
        title: '7. Availability',
        content:
            'We strive to maintain the App available at all times, but we do not guarantee uninterrupted operation. The App may be temporarily unavailable for maintenance, updates, or technical reasons.',
    },
    {
        title: '8. Limitation of Liability',
        content:
            'The App is provided "as is". To the extent permitted by law, we disclaim all warranties, express or implied. We will not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of the App.',
    },
    {
        title: '9. Modifications to Terms',
        content:
            'We reserve the right to modify these terms at any time. Changes will take effect upon their publication in the App. Your continued use of the App after modifications constitutes your acceptance of the new terms.',
    },
    {
        title: '10. Termination',
        content:
            'We reserve the right to restrict or terminate your access to the App if you violate these terms of service. You may stop using the App at any time by uninstalling it.',
    },
    {
        title: '11. Governing Law',
        content:
            'These terms are governed by applicable laws. Any dispute relating to these terms will be submitted to the competent jurisdiction.',
    },
    {
        title: '12. Contact',
        content:
            'For any questions regarding these terms of service, please contact us at:\n\nsupport@dailyfaith.me',
    },
];

export default function TermsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
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
                <Text style={styles.headerTitle}>Terms</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            >
                {/* Hero Badge */}
                <View style={styles.heroBadge}>
                    <View style={styles.heroIcon}>
                        <FileText color={colors.accent} size={28} />
                    </View>
                    <Text style={styles.heroTitle}>Terms of Service</Text>
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
