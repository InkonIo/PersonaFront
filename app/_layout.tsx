import { TextDecoder, TextEncoder } from "text-encoding";
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;
import { StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import * as React from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { WebSocketProvider } from "@/app/WebSocketContext";
import { initI18n } from '@/constants/i18n';
import { useTranslation } from 'react-i18next';
import { setNetworkErrorListener, clearNetworkError, NetworkErrorType, setOfflineStatusListener } from '../store/api';
import ErrorModal from '@/components/ErrorModal';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppAuthProvider } from "./AppAuthProvider";
import { DebugOverlay } from '@/components/DebugOverlay';

export {
    ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        futuraPTLight: require('../assets/fonts/FuturaCyrillicBook.ttf'),
        futuraPTMedium: require('../assets/fonts/FuturaCyrillicMedium.ttf'),
        futuraPTBold: require('../assets/fonts/FuturaCyrillicBold.ttf'),
        ...FontAwesome.font,
    });
    const [i18nReady, setI18nReady] = useState(false);

    useEffect(() => {
        if (error) console.warn("Font loading error:", error);
    }, [error]);

    useEffect(() => {
        if (loaded) {
            initI18n().then(() => {
                setI18nReady(true);
                SplashScreen.hideAsync();
            });
        }
    }, [loaded]);

    if (!loaded || !i18nReady) return null;

    return (
        <Provider store={store}>
            <WebSocketProvider>
                <RootLayoutNav />
            </WebSocketProvider>
        </Provider>
    );
}

function RootLayoutNav() {
    const { t } = useTranslation();

    const [networkError, setNetworkError] = useState<{
        message: string;
        type: NetworkErrorType;
    } | null>(null);

    useEffect(() => {
        setNetworkErrorListener((message, type) => {
            setNetworkError(prev => prev ?? { message, type });
        });
    }, []);

    useEffect(() => {
        setOfflineStatusListener((offline) => {
            if (offline) {
                setNetworkError({
                    message: 'Нет подключения к интернету. Проверьте Wi-Fi или мобильные данные.',
                    type: 'no_internet',
                });
            } else {
                setNetworkError(prev => prev?.type === 'no_internet' ? null : prev);
            }
        });
    }, []);

    const handleCloseError = () => {
        setNetworkError(null);
        setTimeout(() => clearNetworkError(), 500);
    };

    return (
        <GluestackUIProvider config={config}>
            <GestureHandlerRootView style={styles.container}>
                <SafeAreaProvider>
                    {/* AppAuthProvider снаружи BottomSheetModalProvider и Stack —
                        монтируется один раз и не пересоздаётся при навигации */}
                    <AppAuthProvider>
                        <BottomSheetModalProvider>
                            <Stack>
                                <Stack.Screen name="index" options={{ headerShown: false }} />
                                <Stack.Screen name="signup" options={{ headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="login" options={{ headerTitle: t('auth.login'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="policy" options={{ headerTitle: "", headerShown: true, headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="myAnket" options={{ headerShown: true, headerTitle: t('layout.myAnket'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="citiesOrRegions" options={{ headerTitle: t('profile.region'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="professions" options={{ headerTitle: t('layout.profession'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="fieldOfWork" options={{ headerTitle: t('layout.activityField'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="about" options={{ headerTitle: t('layout.about'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="feedback" options={{ headerTitle: t('layout.feedback'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                <Stack.Screen name="search" options={{ headerShown: false }} />
                                <Stack.Screen name="ratingHistory" options={{ headerShown: true, headerBackTitle: t('common.back'), headerTitle: t('layout.rating') }} />
                                <Stack.Screen name="rateAccess" options={{ headerShown: true, headerBackTitle: t('common.back'), headerTitle: t('layout.ratingAccess') }} />
                                <Stack.Screen name="(modals)/white" options={{ headerShown: false, animation: "none" }} />
                                <Stack.Screen name="(modals)/lock" options={{ headerShown: false, animation: "none" }} />
                                <Stack.Screen name="forgot-password" options={{ headerTitle: t('forgotPassword.title'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="settings" options={{ headerTitle: t('layout.settings', 'Настройки'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="legal" options={{ headerTitle: t('legal.title'), headerBackTitle: t('common.back') }} />
                                <Stack.Screen name="user/[id]" options={{ headerShown: true, headerBackTitle: t('common.back'), headerTitle: '' }} />
                            </Stack>
                        </BottomSheetModalProvider>

                        <ErrorModal
                            visible={!!networkError}
                            message={networkError?.message ?? ''}
                            errorType={networkError?.type}
                            onClose={handleCloseError}
                        />
                    </AppAuthProvider>
                </SafeAreaProvider>
            {__DEV__ && <DebugOverlay />}
            </GestureHandlerRootView>
        </GluestackUIProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});