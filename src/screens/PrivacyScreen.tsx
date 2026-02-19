import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';

const LAST_UPDATED = '17 février 2026';

const sections = [
    {
        title: '1. Introduction',
        content:
            'Quiz Biblique ("nous", "notre", "l\'application") s\'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre application mobile.',
    },
    {
        title: '2. Informations collectées',
        content:
            'Nous collectons les types d\'informations suivants :\n\n• Données de progression : Vos scores, niveaux complétés, séries et statistiques de jeu sont stockés localement sur votre appareil.\n\n• Données d\'utilisation : Nous pouvons collecter des données anonymes sur la façon dont vous utilisez l\'application (fréquence d\'utilisation, fonctionnalités utilisées) pour améliorer notre service.\n\n• Identifiants de l\'appareil : Nous pouvons collecter des identifiants anonymes de l\'appareil à des fins d\'analyse.',
    },
    {
        title: '3. Utilisation des informations',
        content:
            'Nous utilisons vos informations pour :\n\n• Fournir et maintenir l\'application\n• Sauvegarder votre progression de jeu\n• Améliorer l\'expérience utilisateur\n• Analyser les tendances d\'utilisation\n• Communiquer des mises à jour importantes',
    },
    {
        title: '4. Stockage des données',
        content:
            'Vos données de progression sont stockées localement sur votre appareil à l\'aide d\'AsyncStorage. Nous ne transférons pas ces données vers des serveurs externes sans votre consentement explicite.',
    },
    {
        title: '5. Services tiers',
        content:
            'L\'application peut utiliser des services tiers qui collectent des informations utilisées pour vous identifier. Ces services incluent :\n\n• Expo / React Native (infrastructure de l\'application)\n• Services d\'analyse anonymes\n\nChacun de ces services a sa propre politique de confidentialité concernant le traitement des données.',
    },
    {
        title: '6. Sécurité',
        content:
            'Nous prenons la sécurité de vos données au sérieux. Bien qu\'aucune méthode de transmission sur Internet ou de stockage électronique ne soit 100% sécurisée, nous nous efforçons d\'utiliser des moyens commercialement acceptables pour protéger vos informations.',
    },
    {
        title: '7. Droits des utilisateurs',
        content:
            'Vous avez le droit de :\n\n• Accéder à vos données personnelles\n• Demander la suppression de vos données\n• Réinitialiser votre progression à tout moment via les paramètres\n• Désactiver les notifications',
    },
    {
        title: '8. Enfants',
        content:
            'Notre application est adaptée à tous les âges. Nous ne collectons pas sciemment d\'informations personnelles auprès d\'enfants de moins de 13 ans sans le consentement parental.',
    },
    {
        title: '9. Modifications',
        content:
            'Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle politique dans l\'application. Nous vous conseillons de consulter cette page régulièrement.',
    },
    {
        title: '10. Contact',
        content:
            'Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à :\n\nsupport@dailyfaith.me',
    },
];

export default function PrivacyScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.card.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confidentialité</Text>
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
                    <Text style={styles.heroTitle}>Politique de Confidentialité</Text>
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
