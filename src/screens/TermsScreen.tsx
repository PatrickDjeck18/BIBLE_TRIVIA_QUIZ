import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';

const LAST_UPDATED = '17 février 2026';

const sections = [
    {
        title: '1. Acceptation des conditions',
        content:
            'En téléchargeant, installant ou utilisant l\'application Quiz Biblique ("l\'Application"), vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'Application.',
    },
    {
        title: '2. Description du service',
        content:
            'Quiz Biblique est une application de quiz éducative et ludique basée sur la Bible. L\'Application propose des questions sur différents livres de la Bible, un système de progression par niveaux, des récompenses quotidiennes et un suivi des statistiques personnelles.',
    },
    {
        title: '3. Utilisation de l\'Application',
        content:
            'Vous vous engagez à :\n\n• Utiliser l\'Application de manière respectueuse et conformément à son objectif éducatif\n• Ne pas tenter de modifier, décompiler ou désassembler l\'Application\n• Ne pas utiliser l\'Application à des fins commerciales sans autorisation\n• Ne pas contourner les mesures de sécurité de l\'Application',
    },
    {
        title: '4. Contenu de l\'Application',
        content:
            'Les questions, réponses et explications fournies dans l\'Application sont basées sur la Bible et sont destinées à des fins éducatives. Nous nous efforçons de fournir des informations exactes, mais nous ne garantissons pas l\'absence totale d\'erreurs.\n\nLe contenu ne constitue pas un enseignement théologique officiel et ne remplace pas l\'étude personnelle de la Bible.',
    },
    {
        title: '5. Propriété intellectuelle',
        content:
            'Tous les éléments de l\'Application (design, code, contenu, graphiques, logos) sont protégés par les lois sur la propriété intellectuelle. Vous ne pouvez pas reproduire, distribuer ou créer des œuvres dérivées sans notre autorisation écrite.',
    },
    {
        title: '6. Progression et données',
        content:
            'Votre progression dans le jeu est stockée localement sur votre appareil. Nous ne sommes pas responsables de la perte de données résultant de :\n\n• La désinstallation de l\'Application\n• Un changement d\'appareil\n• Une réinitialisation de l\'appareil\n• Des erreurs techniques indépendantes de notre volonté',
    },
    {
        title: '7. Disponibilité',
        content:
            'Nous nous efforçons de maintenir l\'Application disponible en permanence, mais nous ne garantissons pas un fonctionnement ininterrompu. L\'Application peut être temporairement indisponible pour maintenance, mises à jour ou pour des raisons techniques.',
    },
    {
        title: '8. Limitation de responsabilité',
        content:
            'L\'Application est fournie "telle quelle". Dans la mesure permise par la loi, nous déclinons toute garantie, expresse ou implicite. Nous ne serons pas responsables des dommages directs, indirects, accessoires ou consécutifs résultant de l\'utilisation de l\'Application.',
    },
    {
        title: '9. Modifications des conditions',
        content:
            'Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication dans l\'Application. Votre utilisation continue de l\'Application après les modifications constitue votre acceptation des nouvelles conditions.',
    },
    {
        title: '10. Résiliation',
        content:
            'Nous nous réservons le droit de restreindre ou de mettre fin à votre accès à l\'Application si vous violez ces conditions d\'utilisation. Vous pouvez cesser d\'utiliser l\'Application à tout moment en la désinstallant.',
    },
    {
        title: '11. Droit applicable',
        content:
            'Ces conditions sont régies par les lois applicables. Tout litige relatif à ces conditions sera soumis à la juridiction compétente.',
    },
    {
        title: '12. Contact',
        content:
            'Pour toute question concernant ces conditions d\'utilisation, veuillez nous contacter à :\n\nsupport@dailyfaith.me',
    },
];

export default function TermsScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.card.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Conditions</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Badge */}
                <View style={styles.heroBadge}>
                    <View style={styles.heroIcon}>
                        <FileText color={colors.accent} size={28} />
                    </View>
                    <Text style={styles.heroTitle}>Conditions d'Utilisation</Text>
                    <Text style={styles.heroDate}>Dernière mise à jour : {LAST_UPDATED}</Text>
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
