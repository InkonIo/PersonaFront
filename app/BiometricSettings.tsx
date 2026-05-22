import {useEffect, useState} from "react";
import { checkBiometricSupport, hasBiometricCredentials, disableBiometricLogin, enableBiometricLogin, authenticateWithBiometric } from "@/hooks/biometricAuth";
import {Switch, View, Platform, Modal, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from "react-native";
import {Input, InputField, InputSlot} from "@gluestack-ui/themed";
import {textStyles} from "@/constants/textStyles";
import { useTranslation } from 'react-i18next';
import { useAppSelector } from "@/store/hooks";
import Colors from "@/constants/Colors";
import { instance } from "@/store/api";
import { ShieldIcon } from 'lucide-react-native';

export const BiometricSettings = () => {
    const { t } = useTranslation();
    const { userInfo } = useAppSelector(state => state.user);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingBiometric, setPendingBiometric] = useState(false);

    const userId = String(userInfo?.id ?? '');

    useEffect(() => {
        const checkSupport = async () => {
            const supported = await checkBiometricSupport();
            setIsBiometricSupported(supported);
            if (!userId) return;
            const hasCredentials = await hasBiometricCredentials(userId);
            setIsBiometricEnabled(hasCredentials);
        };
        checkSupport();
    }, [userId]);

    const handleToggleBiometric = async () => {
        if (isBiometricEnabled) {
            await disableBiometricLogin(userId);
            setIsBiometricEnabled(false);
        } else {
            setPassword('');
            setShowPasswordModal(true);
        }
    };

    const verifyPassword = async (login: string, pwd: string): Promise<boolean> => {
        try {
            await instance.post('public/users/login', { login, password: pwd });
            return true;
        } catch {
            return false;
        }
    };

    const handleEnableBiometric = async () => {
    if (!password.trim()) {
        Alert.alert(t('biometric.alertTitle'), t('signup.passwordRequired'));
        return;
    }

    setIsLoading(true);

    const isPasswordValid = await verifyPassword(userInfo?.login ?? '', password);
    if (!isPasswordValid) {
        setIsLoading(false);
        Alert.alert(t('biometric.loginErrorTitle'), t('biometric.loginError'));
        return;
    }

    // Закрываем модалку
    setShowPasswordModal(false);

    // Небольшая задержка чтобы модалка успела закрыться
    // перед системным диалогом биометрии
    await new Promise(res => setTimeout(res, 300));

    const authSuccess = await authenticateWithBiometric();
    if (!authSuccess) {
        setIsLoading(false);
        Alert.alert(t('biometric.loginErrorTitle'), t('biometric.loginError'));
        return;
    }

    await enableBiometricLogin(userInfo?.login ?? '', password, userId);
    setIsBiometricEnabled(true);
    setPassword('');
    setIsLoading(false);
};

    const handleModalDismissed = async () => {
        if (!pendingBiometric) return;
        setPendingBiometric(false);

        const authSuccess = await authenticateWithBiometric();
        if (!authSuccess) {
            setIsLoading(false);
            Alert.alert(t('biometric.loginErrorTitle'), t('biometric.loginError'));
            return;
        }

        await enableBiometricLogin(userInfo?.login ?? '', password, userId);
        setIsBiometricEnabled(true);
        setPassword('');
        setIsLoading(false);
    };

    if (!isBiometricSupported) return null;

    const biometricLabel = Platform.OS === 'ios' ? t('biometric.faceIdToggle') : t('biometric.touchIdToggle');

    return (
        <View>
            <TouchableOpacity style={styles.row} onPress={handleToggleBiometric} activeOpacity={0.7}>
                <View style={styles.rowIcon}>
                    <ShieldIcon size={20} color={Colors.grayDark} />
                </View>
                    <Text style={[textStyles.body16Light, { color: Colors.text, flex: 1 }]}>
                        {biometricLabel}
                    </Text>
                    <Switch
                        value={isBiometricEnabled}
                        onValueChange={handleToggleBiometric}
                    />
            </TouchableOpacity>

            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.title}>{t('biometric.alertTitle')}</Text>
                        <Text style={styles.hint}>{t('biometric.passwordHint')}</Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('login.passwordPlaceholder')}
                                placeholderTextColor={Colors.grayDark}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowPassword(p => !p)}
                            >
                                <Text style={{ color: Colors.grayDark }}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={[styles.btn, styles.cancelBtn]}
                                onPress={() => setShowPasswordModal(false)}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
                                onPress={handleEnableBiometric}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <ActivityIndicator color="white" />
                                    : <Text style={styles.confirmText}>{t('common.confirm')}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowIcon: {
        marginRight: 12,
        width: 22,
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#000',
    },
    hint: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: '#000',
    },
    eyeBtn: {
        padding: 4,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: '#ccc',
    },
    confirmBtn: {
        backgroundColor: '#4CAF50',
    },
    confirmBtnDisabled: {
        backgroundColor: '#A5D6A7',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
    },
    confirmText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
});