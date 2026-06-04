import React, { createContext, useContext, useCallback } from 'react';

// Define the shape of the context
interface AdContextType {
    showInterstitial: (onClose?: () => void) => void;
    showRewarded: (onReward: () => void, onClose?: () => void) => void;
    isInterstitialLoaded: boolean;
    isRewardedLoaded: boolean;
}

// create context
const AdContext = createContext<AdContextType | undefined>(undefined);

// hook to use the context
export const useAds = () => {
    const context = useContext(AdContext);
    if (!context) {
        throw new Error('useAds must be used within an AdProvider');
    }
    return context;
};

// provider component (web version - no ads)
export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Mock functions for web
    const showInterstitial = useCallback((onClose?: () => void) => {
        console.log('Ad show request on web (mocked)');
        if (onClose) onClose();
    }, []);

    const showRewarded = useCallback((onReward: () => void, onClose?: () => void) => {
        console.log('Rewarded Ad show request on web (mocked)');
        if (onReward) onReward();
        if (onClose) onClose();
    }, []);

    const value = {
        showInterstitial,
        showRewarded,
        isInterstitialLoaded: false, // Always false or true depending on desired behavior? false is safer so UI doesn't try to show it
        isRewardedLoaded: false,
    };

    return (
        <AdContext.Provider value={value}>
            {children}
        </AdContext.Provider>
    );
};
