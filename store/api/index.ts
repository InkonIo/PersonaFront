import axios from 'axios/dist/axios.min.js';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncBiometricTokens } from "@/hooks/biometricAuth";
import { logout } from '../slices/authSlice';
import { store } from '..';

// ─── Auth event emitter ───────────────────────────────────────────────────────
type AuthEventListener = () => void;
let onLogoutListener: AuthEventListener | null = null;

export const setAuthLogoutListener = (listener: AuthEventListener) => {
    onLogoutListener = listener;
};

// Добавь рядом с onLogoutListener
type PendingDeepLinkListener = (url: string) => void;
let onPendingDeepLinkListener: PendingDeepLinkListener | null = null;
let _pendingDeepLink: string | null = null;

export const setPendingDeepLink = (url: string | null) => {
    _pendingDeepLink = url;
};

export const getPendingDeepLink = (): string | null => {
    const url = _pendingDeepLink;
    _pendingDeepLink = null; // consume once
    return url;
};

// ─── Error event emitter ──────────────────────────────────────────────────────
type NetworkErrorListener = (message: string, type: NetworkErrorType) => void;
let onNetworkErrorListener: NetworkErrorListener | null = null;

// ─── Флаг: уже показываем модалку — не спамим листенер ───────────────────────
let isErrorShowing = false;

// ─── Офлайн статус — для блокировки табов ────────────────────────────────────
let _isOffline = false;
type OfflineStatusListener = (offline: boolean) => void;
let onOfflineStatusListener: OfflineStatusListener | null = null;

export const isOffline = () => _isOffline;

export const setOfflineStatusListener = (listener: OfflineStatusListener) => {
    onOfflineStatusListener = listener;
};

const setOfflineStatus = (offline: boolean) => {
    if (_isOffline === offline) return;
    _isOffline = offline;
    onOfflineStatusListener?.(offline);
};

export const setNetworkErrorListener = (listener: NetworkErrorListener) => {
    onNetworkErrorListener = listener;
};

export const showNetworkError = (message: string, type: NetworkErrorType = 'unknown') => {
    if (isErrorShowing) return;
    isErrorShowing = true;
    onNetworkErrorListener?.(message, type);
};

export const clearNetworkError = () => {
    isErrorShowing = false;
};

export type NetworkErrorType =
    | 'no_internet'
    | 'server_down'
    | 'timeout'
    | 'auth_error'
    | 'forbidden'
    | 'not_found'
    | 'server_error'
    | 'validation_error'
    | 'unknown';

export const parseAxiosError = (error: any): { message: string; type: NetworkErrorType } => {
    if (!error.response) {
        if (
            error.code === 'ECONNABORTED' ||
            error.message?.includes('timeout')
        ) {
            return {
                type: 'timeout',
                message: 'Запрос занял слишком долго. Проверьте соединение и попробуйте снова.',
            };
        }
        if (
            error.message?.includes('Network Error') ||
            error.message?.includes('network') ||
            error.code === 'ERR_NETWORK'
        ) {
            return {
                type: 'no_internet',
                message: 'Нет подключения к интернету. Проверьте Wi-Fi или мобильные данные.',
            };
        }
        return {
            type: 'server_down',
            message: 'Не удалось подключиться к серверу. Попробуйте позже.',
        };
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message || error.response.data?.error;

    switch (true) {
        case status === 400:
            return {
                type: 'validation_error',
                message: serverMessage || 'Некорректный запрос. Проверьте введённые данные.',
            };
        case status === 401:
            return {
                type: 'auth_error',
                message: 'Сессия истекла. Пожалуйста, войдите снова.',
            };
        case status === 403:
            return {
                type: 'forbidden',
                message: 'У вас нет доступа к этому разделу.',
            };
        case status === 404:
            return {
                type: 'not_found',
                message: serverMessage || 'Запрашиваемые данные не найдены.',
            };
        case status === 422:
            return {
                type: 'validation_error',
                message: serverMessage || 'Данные не прошли проверку. Попробуйте ещё раз.',
            };
        case status >= 500:
            return {
                type: 'server_error',
                message: 'Ошибка на сервере. Мы уже работаем над этим.',
            };
        default:
            return {
                type: 'unknown',
                message: serverMessage || 'Что-то пошло не так. Попробуйте позже.',
            };
    }
};

// ─── Mutex для refresh ────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

let isHandlingAuthError = false;

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const handleAuthError = async () => {
    console.log('🚨 [handleAuthError] ВЫЗВАН!');
    console.log('🔴 handleAuthError called, isHandlingAuthError:', isHandlingAuthError);
    if (isHandlingAuthError) return;
    isHandlingAuthError = true;

    isRefreshing = false;
    refreshSubscribers = [];

    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');

    onLogoutListener?.();
};

// ─── Тихие статусы — слайсы сами обрабатывают ────────────────────────────────
const SILENT_STATUSES = new Set([401, 400, 422, 404]);

const createAxiosInstance = (baseURL: string) => {
    const instance = axios.create({
        baseURL,
        timeout: 15000,
    });

    instance.interceptors.request.use(
    async (config) => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        } catch (error) {
            console.error('Ошибка при извлечении accessToken:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

    // ── Response interceptor ──────────────────────────────────────────────────
    instance.interceptors.response.use(
        (response) => {
            setOfflineStatus(false);
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            const status = error.response?.status;
            const isSilent = originalRequest?._silent === true;

            // ── Если нет ответа от сервера — ставим офлайн ───────────────────
            if (!error.response) {
                const { type } = parseAxiosError(error);
                if (type === 'no_internet' || type === 'timeout' || type === 'server_down') {
                    setOfflineStatus(true);
                }
            }

            // ── Refresh логика для 401 ────────────────────────────────────────
            if (status === 401) {
                // ✅ Silent запросы (polling getMyChats и т.д.) — сразу выходим,
                // без refresh и без logout. Слайс сам получит rejectWithValue.
                if (isSilent) {
                    return Promise.reject(error);
                }

                console.log('🔴 401 received, _retry:', originalRequest._retry, 'url:', originalRequest.url);

                if (originalRequest._retry) {
                    await handleAuthError();
                    return Promise.reject(error);
                }
                originalRequest._retry = true;

                if (isRefreshing) {
                    return new Promise((resolve) => {
                        addRefreshSubscriber((newToken: string) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            resolve(instance(originalRequest));
                        });
                    });
                }

                isRefreshing = true;

                try {
                    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
                    if (!storedRefreshToken) {
                        await handleAuthError();
                        return Promise.reject(error);
                    }

                    const response = await instance.post('public/users/refresh', {
                        refreshToken: storedRefreshToken,
                    });
                    const { accessToken, refreshToken } = response.data;

                    await AsyncStorage.setItem('accessToken', accessToken);
                    if (refreshToken) {
                        await AsyncStorage.setItem('refreshToken', refreshToken);
                    }

                    await syncBiometricTokens();

                    isRefreshing = false;
                    onRefreshed(accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return instance(originalRequest);
                } catch (refreshError) {
                    console.error('Refresh провалился:', refreshError);
                    await handleAuthError();
                    return Promise.reject(refreshError);
                }
            }

            // ── Глобальный обработчик остальных ошибок ────────────────────────
            const isAdminRequest = originalRequest?.url?.includes('admin');
                if (!SILENT_STATUSES.has(status) && !isSilent && !isAdminRequest) {
                    const { message, type } = parseAxiosError(error);
                    if (type !== 'no_internet' && type !== 'server_down' && type !== 'timeout') {
                        showNetworkError(message, type);
                    }
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

const instance = createAxiosInstance("http://91.224.74.12:8080");
const chatInstance = createAxiosInstance("http://91.224.74.12:8081");

export { instance, chatInstance };