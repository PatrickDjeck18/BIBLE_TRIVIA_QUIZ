import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { NativeAd, NativeAdView, NativeAsset, NativeAssetType, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const adUnitId = __DEV__
    ? TestIds.NATIVE
    : Platform.select({
        android: 'ca-app-pub-4253750298784159/5288868158',
        ios: 'ca-app-pub-4253750298784159/3115646326',
        default: TestIds.NATIVE,
    }) || TestIds.NATIVE;

export const BottomBannerAd = () => {
    const insets = useSafeAreaInsets();
    const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        NativeAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        }).then((ad) => {
            if (isMounted) setNativeAd(ad);
        }).catch(err => {
            console.warn('Native Ad failed to load:', err);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!nativeAd) {
        return null; // Don't render anything if the ad isn't loaded yet
    }

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
            <NativeAdView nativeAd={nativeAd} style={styles.nativeAdView}>
                <View style={styles.adContent}>
                    {/* Left side: Icon */}
                    {nativeAd.icon ? (
                        <NativeAsset assetType={NativeAssetType.ICON}>
                            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
                        </NativeAsset>
                    ) : (
                        <View style={styles.iconPlaceholder} />
                    )}

                    {/* Middle: Headline & Body */}
                    <View style={styles.textContainer}>
                        <NativeAsset assetType={NativeAssetType.HEADLINE}>
                            <Text style={styles.headline} numberOfLines={1}>{nativeAd.headline}</Text>
                        </NativeAsset>
                        
                        <NativeAsset assetType={NativeAssetType.BODY}>
                            <Text style={styles.body} numberOfLines={2}>{nativeAd.body}</Text>
                        </NativeAsset>
                    </View>

                    {/* Right side: Call To Action */}
                    {nativeAd.callToAction && (
                        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                            <View style={styles.ctaButton}>
                                <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
                            </View>
                        </NativeAsset>
                    )}
                </View>
                
                {/* Required Ad Attribution Badge */}
                <View style={styles.adBadge}>
                    <Text style={styles.adBadgeText}>Ad</Text>
                </View>
            </NativeAdView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    nativeAdView: {
        width: '100%',
        paddingTop: 16, // Extra padding for the Ad badge
        position: 'relative',
        overflow: 'hidden',
    },
    adContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    iconPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headline: {
        color: colors.card.text,
        fontSize: typography.fontSize.bodySmall,
        fontFamily: typography.fontFamily.bold,
        marginBottom: 2,
    },
    body: {
        color: colors.card.textSecondary,
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.regular,
        lineHeight: 16,
    },
    ctaButton: {
        backgroundColor: colors.accent,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        color: '#000',
        fontSize: typography.fontSize.caption,
        fontFamily: typography.fontFamily.bold,
    },
    adBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderBottomRightRadius: 8,
    },
    adBadgeText: {
        color: '#000',
        fontSize: typography.fontSize.tiny,
        fontFamily: typography.fontFamily.bold,
        textTransform: 'uppercase',
    },
});
