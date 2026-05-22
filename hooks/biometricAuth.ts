import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCredentialsKey = (userId: string) => `bio_credentials_${userId}`;
const getBiometricEnabledKey = (userId: string) => `biometricEnabled_${userId}`;
const LAST_USER_ID_KEY = 'biometric_last_user_id';

export const checkBiometricSupport = async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
};

export const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Войдите с помощью биометрии',
            cancelLabel: 'Отмена',
            fallbackLabel: 'Использовать пароль',
            disableDeviceFallback: false,
        });
        // Задержка здесь — после того как Face ID закрылся
        await new Promise(resolve => setTimeout(resolve, 300));
        return result.success;
    } catch (error) {
        console.error('Ошибка биометрии:', error);
        return false;
    }
};

export const enableBiometricLogin = async (login: string, password: string, userId: string): Promise<void> => {
    await SecureStore.setItemAsync(getCredentialsKey(userId), JSON.stringify({ login, password }));
    await AsyncStorage.setItem(getBiometricEnabledKey(userId), 'true');
    await AsyncStorage.setItem(LAST_USER_ID_KEY, userId); // ← ДОБАВИТЬ
};

export const getBiometricCredentials = async (userId: string): Promise<{ login: string; password: string } | null> => {
    try {
        const biometricEnabled = await AsyncStorage.getItem(getBiometricEnabledKey(userId));
        if (biometricEnabled !== 'true') return null;

        const stored = await SecureStore.getItemAsync(getCredentialsKey(userId));
        if (!stored) return null;

        const authSuccess = await authenticateWithBiometric();
        if (!authSuccess) return null;

        return JSON.parse(stored);
    } catch (error) {
        console.error('Ошибка getBiometricCredentials:', error);
        return null;
    }
};

export const hasBiometricCredentials = async (userId: string): Promise<boolean> => {
    try {
        const biometricEnabled = await AsyncStorage.getItem(getBiometricEnabledKey(userId));
        if (biometricEnabled !== 'true') return false;
        const stored = await SecureStore.getItemAsync(getCredentialsKey(userId));
        return !!stored;
    } catch {
        return false;
    }
};

export const disableBiometricLogin = async (userId: string): Promise<void> => {
    await SecureStore.deleteItemAsync(getCredentialsKey(userId));
    await AsyncStorage.removeItem(getBiometricEnabledKey(userId));
    await AsyncStorage.removeItem(LAST_USER_ID_KEY); // ← ДОБАВИТЬ
};

export const syncBiometricTokens = async (): Promise<void> => {};
export const handleBiometricAuth = async (): Promise<boolean> => false;


export const saveLastBiometricUserId = async (userId: string): Promise<void> => {
    await AsyncStorage.setItem(LAST_USER_ID_KEY, userId);
};

export const getLastBiometricUserId = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(LAST_USER_ID_KEY);
};

export const rebindBiometricLogin = async (login: string, password: string, newUserId: string): Promise<void> => {
    const lastUserId = await getLastBiometricUserId();
    if (lastUserId && lastUserId !== newUserId) {
        await disableBiometricLogin(lastUserId); // чистим старый аккаунт
    }
    await enableBiometricLogin(login, password, newUserId); // пишем новый
};