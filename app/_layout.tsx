import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { colors } from '../src/theme/colors';
import { GameProvider } from '../src/context/GameContext';
import { AdProvider } from '../src/context/AdContext';
import { BottomBannerAd } from '../src/components/BottomBannerAd';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { useNotifications } from '../src/hooks/useNotifications';

SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceGrotesk_400Regular,
        SpaceGrotesk_500Medium,
        SpaceGrotesk_700Bold,
    });

    // Initialize notifications
    useNotifications();

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    const MyDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: colors.background,
        },
    };

    return (
        <ThemeProvider value={MyDarkTheme}>
            <GameProvider>
                <AdProvider>
                    <View style={styles.root}>
                        <StatusBar style="light" />
                        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
                        <BottomBannerAd />
                    </View>
                </AdProvider>
            </GameProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
