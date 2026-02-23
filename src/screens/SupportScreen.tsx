import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Linking,
    Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Headphones,
    Mail,
    MessageCircle,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Send,
    Bug,
    Lightbulb,
    Star,
} from 'lucide-react-native';

const SUPPORT_EMAIL = 'support@dailyfaith.me';

interface FAQItem {
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        question: 'How does the levels system work?',
        answer:
            'Each book of the Bible corresponds to a level. You must complete one level to unlock the next. Each level contains 10 questions randomly selected from the available questions for that book.',
    },
    {
        question: 'How do I earn stars?',
        answer:
            'Stars are awarded based on your percentage of correct answers:\n\n⭐ 1 star: 50% or more\n⭐⭐ 2 stars: 70% or more\n⭐⭐⭐ 3 stars: 90% or more',
    },
    {
        question: 'How does the daily streak work?',
        answer:
            'Your streak increases every day you play. If you miss a day, your streak is reset. Maintain a long streak to earn daily reward bonuses!',
    },
    {
        question: 'Can I replay a level?',
        answer:
            'Yes! You can replay any already unlocked level as many times as you want. The questions will be different each time as they are randomly selected.',
    },
    {
        question: 'Is my progress saved?',
        answer:
            'Yes, your progress is automatically saved on your device. However, if you uninstall the application or change devices, your progress will be lost.',
    },
    {
        question: 'How do I reset my progress?',
        answer:
            'You can reset your progress in Settings > Data > Reset Progress. Warning: this action is irreversible!',
    },
];

const contactOptions = [
    {
        icon: <Bug color={colors.accent} size={22} />,
        title: 'Report a bug',
        description: 'A technical problem? Tell us about it.',
        subject: 'Bug Report - Bible Quiz',
    },
    {
        icon: <Lightbulb color={colors.accent} size={22} />,
        title: 'Suggest a feature',
        description: 'Have an idea? We are listening.',
        subject: 'Feature Suggestion - Bible Quiz',
    },
    {
        icon: <MessageCircle color={colors.accent} size={22} />,
        title: 'General question',
        description: 'Any other question or comment.',
        subject: 'General Question - Bible Quiz',
    },
];

const FAQAccordion: React.FC<{ item: FAQItem }> = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <TouchableOpacity
            style={styles.faqItem}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <HelpCircle color={colors.accent} size={18} />
                <Text style={styles.faqQuestion}>{item.question}</Text>
                {expanded ? (
                    <ChevronUp color={colors.card.textSecondary} size={18} />
                ) : (
                    <ChevronDown color={colors.card.textSecondary} size={18} />
                )}
            </View>
            {expanded && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
            )}
        </TouchableOpacity>
    );
};

export default function SupportScreen() {
    const router = useRouter();

    const handleContactPress = (subject: string) => {
        const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
        Linking.openURL(mailUrl);
    };

    const handleEmailPress = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    };

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
                <Text style={styles.headerTitle}>Support</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero */}
                <View style={styles.heroBadge}>
                    <View style={styles.heroIcon}>
                        <Headphones color={colors.accent} size={28} />
                    </View>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        Check our FAQ or contact us directly
                    </Text>
                </View>

                {/* Quick Email */}
                <TouchableOpacity style={styles.emailBanner} onPress={handleEmailPress} activeOpacity={0.7}>
                    <Mail color={colors.accent} size={20} />
                    <View style={styles.emailBannerText}>
                        <Text style={styles.emailLabel}>Send us an email</Text>
                        <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
                    </View>
                    <Send color={colors.card.textSecondary} size={18} />
                </TouchableOpacity>

                {/* Contact Options */}
                <Text style={styles.sectionHeader}>CONTACT US</Text>
                <View style={styles.contactGrid}>
                    {contactOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactCard}
                            onPress={() => handleContactPress(option.subject)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.contactIconWrapper}>
                                {option.icon}
                            </View>
                            <Text style={styles.contactTitle}>{option.title}</Text>
                            <Text style={styles.contactDesc}>{option.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ */}
                <Text style={styles.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>
                <View style={styles.faqContainer}>
                    {faqItems.map((item, index) => (
                        <View key={index}>
                            <FAQAccordion item={item} />
                            {index < faqItems.length - 1 && <View style={styles.faqDivider} />}
                        </View>
                    ))}
                </View>

                {/* Bottom CTA */}
                <View style={styles.bottomCta}>
                    <Text style={styles.bottomCtaTitle}>Didn't find an answer?</Text>
                    <TouchableOpacity
                        style={styles.bottomCtaButton}
                        onPress={() => handleContactPress('Help Request - Bible Quiz')}
                        activeOpacity={0.7}
                    >
                        <Mail color="#FFFFFF" size={18} />
                        <Text style={styles.bottomCtaButtonText}>Contact Us</Text>
                    </TouchableOpacity>
                </View>

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

    // Hero
    heroBadge: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 28,
        backgroundColor: colors.card.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.card.border,
    },
    heroIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    heroTitle: {
        color: colors.card.text,
        fontSize: 19,
        fontFamily: typography.fontFamily.bold,
        marginBottom: 6,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: colors.card.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.regular,
        textAlign: 'center',
        paddingHorizontal: 24,
    },

    // Email Banner
    emailBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.accentDim,
        padding: 16,
        marginBottom: 24,
        gap: 14,
    },
    emailBannerText: {
        flex: 1,
    },
    emailLabel: {
        color: colors.card.text,
        fontSize: 14,
        fontFamily: typography.fontFamily.medium,
        marginBottom: 2,
    },
    emailAddress: {
        color: colors.accent,
        fontSize: 13,
        fontFamily: typography.fontFamily.regular,
    },

    // Section Header
    sectionHeader: {
        color: colors.card.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },

    // Contact Grid
    contactGrid: {
        gap: 12,
        marginBottom: 28,
    },
    contactCard: {
        backgroundColor: colors.card.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.card.border,
        padding: 18,
    },
    contactIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    contactTitle: {
        color: colors.card.text,
        fontSize: 16,
        fontFamily: typography.fontFamily.bold,
        marginBottom: 4,
    },
    contactDesc: {
        color: colors.card.textSecondary,
        fontSize: 13,
        fontFamily: typography.fontFamily.regular,
        lineHeight: 19,
    },

    // FAQ
    faqContainer: {
        backgroundColor: colors.card.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.card.border,
        overflow: 'hidden',
        marginBottom: 28,
    },
    faqItem: {
        padding: 16,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    faqQuestion: {
        flex: 1,
        color: colors.card.text,
        fontSize: 15,
        fontFamily: typography.fontFamily.medium,
    },
    faqAnswer: {
        color: colors.card.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.regular,
        lineHeight: 22,
        marginTop: 12,
        marginLeft: 28,
    },
    faqDivider: {
        height: 1,
        backgroundColor: colors.card.border,
        marginHorizontal: 16,
    },

    // Bottom CTA
    bottomCta: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: colors.card.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.card.border,
        gap: 16,
    },
    bottomCtaTitle: {
        color: colors.card.textSecondary,
        fontSize: 15,
        fontFamily: typography.fontFamily.medium,
    },
    bottomCtaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    bottomCtaButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: typography.fontFamily.bold,
    },
});
