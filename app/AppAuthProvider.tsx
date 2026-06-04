import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getUserInfo } from "@/store/slices/usersSlice";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuth, setInitialized } from "@/store/slices/authSlice";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import React from "react";
import { setAuthLogoutListener, setPendingDeepLink, getPendingDeepLink } from "@/store/api";
import { useWebSocket } from "@/app/WebSocketContext";
import { useAppSelector } from "@/store/hooks";
import * as Linking from 'expo-linking';

const resolveDeepLinkPath = (url: string): string | null => {
    try {
        console.log('🔗 resolveDeepLinkPath raw url:', url); // добавь лог
        const parsed = Linking.parse(url);
        console.log('🔗 parsed:', JSON.stringify(parsed));   // и этот
        
        const path = (parsed.path ?? '').replace(/^\//, '');
        if (!path) return null;

        const userMatch = path.match(/^user\/(.+)$/);
        if (userMatch) return `/user/${userMatch[1]}`;

        // Если path это просто число — это и есть user id
        const bareIdMatch = path.match(/^(\d+)$/);
        if (bareIdMatch) return `/user/${bareIdMatch[1]}`;

        return `/${path}`;
    } catch {
        return null;
    }
};

export const AppAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isInitialized, isAuthenticated } = useAppSelector(state => state.auth);
    const { connectWebSocket, disconnectWebSocket } = useWebSocket();
    const isAuthInitiating = useRef(false);
    const wasAuthenticated = useRef(false);
    const didInitialRedirect = useRef(false);

    // Редирект при старте с токеном
    useEffect(() => {
        if (isInitialized && isAuthenticated && !didInitialRedirect.current) {
            didInitialRedirect.current = true;
            wasAuthenticated.current = true;
            const savedUrl = getPendingDeepLink();
            const deepLinkPath = savedUrl ? resolveDeepLinkPath(savedUrl) : null;
            router.replace(deepLinkPath as any ?? '/(tabs)/home');
        }
    }, [isInitialized, isAuthenticated]);

    // Убери wasAuthenticated совсем, сделай проще:
useEffect(() => {
    if (!isInitialized) return;
    
    if (isAuthenticated) {
        if (!didInitialRedirect.current) {
            didInitialRedirect.current = true;
            const savedUrl = getPendingDeepLink();
            const deepLinkPath = savedUrl ? resolveDeepLinkPath(savedUrl) : null;
            router.replace(deepLinkPath as any ?? '/(tabs)/home');
        }
    } else {
        // Сбрасываем флаг чтобы после повторного логина снова редиректнуло
        didInitialRedirect.current = false;
        router.replace('/');
    }
}, [isAuthenticated, isInitialized]);

    

    // Logout listener от interceptor
    useEffect(() => {
        setAuthLogoutListener(() => {
            console.log('🚨 [onLogoutListener] ВЫЗВАН!');
            disconnectWebSocket();
            dispatch(setAuth(false));
        });
    }, []);

    // Инициализация авторизации — один раз
    useEffect(() => {
        if (isAuthInitiating.current) {
            console.log('⛔ [initAuth] уже запущен, пропускаем');
            return;
        }
        isAuthInitiating.current = true;

        const initAuth = async () => {
            try {
                console.log('🚀 [initAuth] START');
                const initialUrl = await Linking.getInitialURL();
                console.log('🔗 [initAuth] initialUrl:', initialUrl);
                if (initialUrl) {
                    setPendingDeepLink(initialUrl);
                }

                const accessToken = await AsyncStorage.getItem('accessToken');
                const userInitiatedLogout = await AsyncStorage.getItem('userInitiatedLogout');

                console.log('🔑 [initAuth] accessToken:', accessToken ? 'ЕСТЬ' : 'НЕТ');
                console.log('🚪 [initAuth] userInitiatedLogout:', userInitiatedLogout);

                if (!accessToken) {
                    console.log('❌ [initAuth] Токена нет — идём на главную');
                    dispatch(setAuth(false));
                    dispatch(setInitialized(true));
                    return;
                }

                if (userInitiatedLogout) {
                    console.log('🧹 [initAuth] Сбрасываем флаг userInitiatedLogout');
                    await AsyncStorage.removeItem('userInitiatedLogout');
                }

                console.log('📡 [initAuth] Вызываем getUserInfo...');

                dispatch(getUserInfo())
                    .unwrap()
                    .then((user) => {
                        console.log('✅ [initAuth] getUserInfo SUCCESS, userId:', user?.id);
                        try {
                            dispatch(setAuth(true));
                            console.log('✅ setAuth done');
                            connectWebSocket(user.id);
                            console.log('✅ connectWebSocket done');
                            dispatch(setInitialized(true));
                            console.log('✅ setInitialized done');
                        } catch (navError) {
                            console.log('💣 [initAuth] крашнулось внутри .then():', navError);
                        }
                    })
                    .catch(async (error) => {
                        console.log('💥 [initAuth] getUserInfo FAILED');
                        const isNetworkError = !error?.status || error?.status >= 500;
                        if (isNetworkError) {
                            console.log('🌐 [initAuth] Сетевая ошибка — пускаем как авторизованного');
                            dispatch(setAuth(true));
                            dispatch(setInitialized(true));
                            return;
                        }
                        console.log('🔴 [initAuth] 401 — чистим токены');
                        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                        dispatch(setAuth(false));
                        dispatch(setInitialized(true));
                    });
            } catch (e) {
                console.log('💀 [initAuth] UNEXPECTED CATCH:', e);
                setPendingDeepLink(null);
                dispatch(setAuth(false));
                dispatch(setInitialized(true));
            }
        };

        initAuth();
    }, []);

    useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
        if (!url) return;
        const path = resolveDeepLinkPath(url);
        if (path) router.replace(path as any);
    });
    return () => subscription.remove();
}, []);

    if (!isInitialized) return <LoadingOverlay loading={true} />;
    return children;
};