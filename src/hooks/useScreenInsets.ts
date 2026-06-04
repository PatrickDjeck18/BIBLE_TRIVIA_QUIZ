import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Approximate native ad strip height (content + padding) when loaded */
export const BOTTOM_AD_HEIGHT = Platform.OS === 'web' ? 0 : 100;

export function useScreenInsets() {
    const insets = useSafeAreaInsets();
    return {
        top: insets.top,
        bottom: insets.bottom,
        /** Extra bottom space for scroll content above the global banner ad */
        contentBottom: insets.bottom + (BOTTOM_AD_HEIGHT > 0 ? 12 : 24),
    };
}
