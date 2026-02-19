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
        question: 'Comment fonctionne le système de niveaux ?',
        answer:
            'Chaque livre de la Bible correspond à un niveau. Vous devez compléter un niveau pour débloquer le suivant. Chaque niveau contient 10 questions sélectionnées aléatoirement parmi les questions disponibles pour ce livre.',
    },
    {
        question: 'Comment gagner des étoiles ?',
        answer:
            'Les étoiles sont attribuées en fonction de votre pourcentage de bonnes réponses :\n\n⭐ 1 étoile : 50% ou plus\n⭐⭐ 2 étoiles : 70% ou plus\n⭐⭐⭐ 3 étoiles : 90% ou plus',
    },
    {
        question: 'Comment fonctionne la série quotidienne ?',
        answer:
            'Votre série augmente chaque jour où vous jouez. Si vous manquez un jour, votre série est réinitialisée. Maintenez une longue série pour gagner des bonus de récompense quotidienne !',
    },
    {
        question: 'Puis-je rejouer un niveau ?',
        answer:
            'Oui ! Vous pouvez rejouer n\'importe quel niveau déjà débloqué autant de fois que vous le souhaitez. Les questions seront différentes à chaque tentative car elles sont sélectionnées aléatoirement.',
    },
    {
        question: 'Ma progression est-elle sauvegardée ?',
        answer:
            'Oui, votre progression est automatiquement sauvegardée sur votre appareil. Cependant, si vous désinstallez l\'application ou changez d\'appareil, votre progression sera perdue.',
    },
    {
        question: 'Comment réinitialiser ma progression ?',
        answer:
            'Vous pouvez réinitialiser votre progression dans Paramètres > Données > Réinitialiser la progression. Attention : cette action est irréversible !',
    },
];

const contactOptions = [
    {
        icon: <Bug color={colors.accent} size={22} />,
        title: 'Signaler un bug',
        description: 'Un problème technique ? Dites-le nous.',
        subject: 'Bug Report - Quiz Biblique',
    },
    {
        icon: <Lightbulb color={colors.accent} size={22} />,
        title: 'Suggérer une fonctionnalité',
        description: 'Vous avez une idée ? Nous sommes à l\'écoute.',
        subject: 'Feature Suggestion - Quiz Biblique',
    },
    {
        icon: <MessageCircle color={colors.accent} size={22} />,
        title: 'Question générale',
        description: 'Toute autre question ou commentaire.',
        subject: 'General Question - Quiz Biblique',
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
                    <Text style={styles.heroTitle}>Comment pouvons-nous vous aider ?</Text>
                    <Text style={styles.heroSubtitle}>
                        Consultez notre FAQ ou contactez-nous directement
                    </Text>
                </View>

                {/* Quick Email */}
                <TouchableOpacity style={styles.emailBanner} onPress={handleEmailPress} activeOpacity={0.7}>
                    <Mail color={colors.accent} size={20} />
                    <View style={styles.emailBannerText}>
                        <Text style={styles.emailLabel}>Envoyez-nous un email</Text>
                        <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
                    </View>
                    <Send color={colors.card.textSecondary} size={18} />
                </TouchableOpacity>

                {/* Contact Options */}
                <Text style={styles.sectionHeader}>NOUS CONTACTER</Text>
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
                <Text style={styles.sectionHeader}>QUESTIONS FRÉQUENTES</Text>
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
                    <Text style={styles.bottomCtaTitle}>Vous n'avez pas trouvé de réponse ?</Text>
                    <TouchableOpacity
                        style={styles.bottomCtaButton}
                        onPress={() => handleContactPress('Help Request - Quiz Biblique')}
                        activeOpacity={0.7}
                    >
                        <Mail color="#000" size={18} />
                        <Text style={styles.bottomCtaButtonText}>Contactez-nous</Text>
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
        backgroundColor: 'rgba(92, 179, 56, 0.12)',
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
        borderColor: 'rgba(92, 179, 56, 0.25)',
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
        backgroundColor: 'rgba(92, 179, 56, 0.1)',
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
        color: '#000',
        fontSize: 15,
        fontFamily: typography.fontFamily.bold,
    },
});
