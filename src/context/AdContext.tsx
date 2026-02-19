import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
    InterstitialAd,
    RewardedAd,
    TestIds,
    AdEventType,
    RewardedAdEventType
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID = __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        android: 'ca-app-pub-4253750298784159/5928126125',
        ios: 'ca-app-pub-4253750298784159/7897472478',
        default: TestIds.INTERSTITIAL,
    }) || TestIds.INTERSTITIAL;

const REWARDED_ID = __DEV__
    ? TestIds.REWARDED
    : Platform.select({
        android: 'ca-app-pub-4253750298784159/4994318403',
        ios: 'ca-app-pub-4253750298784159/8308536012',
        default: TestIds.REWARDED,
    }) || TestIds.REWARDED;

// Create ad instances outside component to prevent recreation
const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
});

const rewarded = RewardedAd.createForAdRequest(REWARDED_ID, {
    requestNonPersonalizedAdsOnly: true,
});

interface AdContextType {
    showInterstitial: (onClose?: () => void) => void;
    showRewarded: (onReward: () => void, onClose?: () => void) => void;
    isInterstitialLoaded: boolean;
    isRewardedLoaded: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const useAds = () => {
    const context = useContext(AdContext);
    if (!context) {
        throw new Error('useAds must be used within an AdProvider');
    }
    return context;
};

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
    const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);

    // Refs to track loaded state without triggering re-renders in effects
    const isInterstitialLoadedRef = useRef(false);
    const isRewardedLoadedRef = useRef(false);

    // Callbacks ref to handle closure issues
    const interstitialCloseCallback = useRef<(() => void) | null>(null);
    const rewardedRewardCallback = useRef<(() => void) | null>(null);
    const rewardedCloseCallback = useRef<(() => void) | null>(null);

    // --- Interstitial Setup ---
    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsInterstitialLoaded(true);
            isInterstitialLoadedRef.current = true;
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setIsInterstitialLoaded(false);
            isInterstitialLoadedRef.current = false;
            interstitial.load(); // Reload for next time
            if (interstitialCloseCallback.current) {
                interstitialCloseCallback.current();
                interstitialCloseCallback.current = null;
            }
        });

        const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('Interstitial Ad Error:', error);
            setIsInterstitialLoaded(false);
            isInterstitialLoadedRef.current = false;
            // Retry loading with backoff? For now just simple retry
            setTimeout(() => interstitial.load(), 5000); // 5 sec retry 
        });

        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    // --- Rewarded Setup ---
    useEffect(() => {
        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsRewardedLoaded(true);
            isRewardedLoadedRef.current = true;
        });

        const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            if (rewardedRewardCallback.current) {
                rewardedRewardCallback.current();
                rewardedRewardCallback.current = null;
            }
        });

        const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
            setIsRewardedLoaded(false);
            isRewardedLoadedRef.current = false;
            rewarded.load(); // Reload
            if (rewardedCloseCallback.current) {
                rewardedCloseCallback.current();
                rewardedCloseCallback.current = null;
            }
        });

        const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('Rewarded Ad Error:', error);
            setIsRewardedLoaded(false);
            isRewardedLoadedRef.current = false;
            setTimeout(() => rewarded.load(), 5000);
        });

        rewarded.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    // --- 2 Minute Timer ---
    useEffect(() => {
        const timer = setInterval(() => {
            if (isInterstitialLoadedRef.current) {
                console.log('Showing 2-min interstitial');
                interstitial.show();
            } else {
                console.log('Interstitial not loaded for 2-min timer');
                interstitial.load();
            }
        }, 120000); // 120 seconds = 2 minutes

        return () => clearInterval(timer);
    }, []);

    const showInterstitial = useCallback((onClose?: () => void) => {
        if (isInterstitialLoadedRef.current) {
            interstitialCloseCallback.current = onClose || null;
            interstitial.show();
        } else {
            console.log('Interstitial not ready, calling callback immediately');
            if (onClose) onClose();
        }
    }, []);

    const showRewarded = useCallback((onReward: () => void, onClose?: () => void) => {
        if (isRewardedLoadedRef.current) {
            rewardedRewardCallback.current = onReward;
            rewardedCloseCallback.current = onClose || null;
            rewarded.show();
        } else {
            console.log('Rewarded not ready');
            // Maybe show alert or just callback?
            if (onClose) onClose();
        }
    }, []);

    return (
        <AdContext.Provider value={{ showInterstitial, showRewarded, isInterstitialLoaded, isRewardedLoaded }}>
            {children}
        </AdContext.Provider>
    );
};
