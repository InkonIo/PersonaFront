import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, Platform,
    Alert, TouchableOpacity, TouchableWithoutFeedback,
    Keyboard, KeyboardAvoidingView, ScrollView, Animated,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useNavigation, useRouter } from 'expo-router';
import { textStyles } from "@/constants/textStyles";
import {
    Button, ButtonText, Center, EyeIcon, EyeOffIcon,
    FormControl, FormControlLabel, FormControlLabelText,
    Input, InputField, InputIcon, InputSlot, VStack
} from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUserInfo, loginUser } from "@/store/slices/usersSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import {
    checkBiometricSupport, enableBiometricLogin, getBiometricCredentials,
    hasBiometricCredentials, getLastBiometricUserId,
    rebindBiometricLogin
} from "@/hooks/biometricAuth";
import { ScanFace, Fingerprint } from "lucide-react-native";
import { useWebSocket } from "@/app/WebSocketContext";
import { StackActions } from '@react-navigation/native';
import { setAuth } from '@/store/slices/authSlice';

const LOGO_SIZE_NORMAL = 128;
const LOGO_SIZE_SMALL = 72;

const Page = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const { loading } = useAppSelector(state => state.user);
    const { bottom, top } = useSafeAreaInsets();
    const { connectWebSocket } = useWebSocket();
    const [biometricUserId, setBiometricUserId] = useState<string | null>(null);
    const router = useRouter();


    // Анимация логотипа
    const logoSize = useRef(new Animated.Value(LOGO_SIZE_NORMAL)).current;
    const logoMarginBottom = useRef(new Animated.Value(32)).current;
    const welcomeOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardWillShow', () => {
            Animated.parallel([
                Animated.timing(logoSize, {
                    toValue: LOGO_SIZE_SMALL,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(logoMarginBottom, {
                    toValue: 16,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(welcomeOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ]).start();
        });

        const hideSub = Keyboard.addListener('keyboardWillHide', () => {
            Animated.parallel([
                Animated.timing(logoSize, {
                    toValue: LOGO_SIZE_NORMAL,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(logoMarginBottom, {
                    toValue: 32,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(welcomeOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: false,
                }),
            ]).start();
        });

        const showSubAndroid = Keyboard.addListener('keyboardDidShow', () => {
            if (Platform.OS === 'android') {
                Animated.parallel([
                    Animated.timing(logoSize, {
                        toValue: LOGO_SIZE_SMALL,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(logoMarginBottom, {
                        toValue: 16,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(welcomeOpacity, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: false,
                    }),
                ]).start();
            }
        });

        const hideSubAndroid = Keyboard.addListener('keyboardDidHide', () => {
            if (Platform.OS === 'android') {
                Animated.parallel([
                    Animated.timing(logoSize, {
                        toValue: LOGO_SIZE_NORMAL,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(logoMarginBottom, {
                        toValue: 32,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(welcomeOpacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                ]).start();
            }
        });

        return () => {
            showSub.remove();
            hideSub.remove();
            showSubAndroid.remove();
            hideSubAndroid.remove();
        };
    }, []);

    useEffect(() => {
        const checkBiometric = async () => {
            const supported = await checkBiometricSupport();
            setIsBiometricSupported(supported);
            if (!supported) return;
            const lastUserId = await getLastBiometricUserId();
            if (!lastUserId) return;
            const hasCredentials = await hasBiometricCredentials(lastUserId);
            if (hasCredentials) {
                setBiometricUserId(lastUserId);
                setIsBiometricEnabled(true);
            }
        };
        checkBiometric();
    }, []);

    const handleState = () => setShowPassword(s => !s);

    const navigateToHome = () => {
    router.replace('/(tabs)/home');
};

    const logIn = async () => {
    try {
        const resultAction = await dispatch(loginUser({ login, password }));
        const credentials = unwrapResult(resultAction);
        const userInfo = await dispatch(getUserInfo());
        const unwrappedUserInfo = unwrapResult(userInfo);
        const userId = String(unwrappedUserInfo.id ?? '');
        connectWebSocket(unwrappedUserInfo.id);

        const navigateToHome = () => {
            dispatch(setAuth(true)); // ← setAuth ПОСЛЕ навигации
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "(tabs)" }] }));
        };

        if (credentials && unwrappedUserInfo) {
            const lastUserId = await getLastBiometricUserId();
            const alreadyHasBio = await hasBiometricCredentials(userId);

            if (alreadyHasBio) {
                navigateToHome();
            } else if (lastUserId && lastUserId !== userId) {
                setTimeout(() => {
                    Alert.alert(
                        t('biometric.alertTitle'),
                        t('biometric.rebindMessage'),
                        [
                            { text: t('biometric.no'), onPress: navigateToHome },
                            {
                                text: t('biometric.yes'), onPress: async () => {
                                    await rebindBiometricLogin(login, password, userId);
                                    navigateToHome();
                                }
                            },
                        ]
                    );
                }, 500);
            } else {
                setTimeout(() => {
                    Alert.alert(
                        t('biometric.alertTitle'),
                        t('biometric.alertMessage'),
                        [
                            { text: t('biometric.no'), onPress: navigateToHome },
                            {
                                text: t('biometric.yes'), onPress: async () => {
                                    await enableBiometricLogin(login, password, userId);
                                    navigateToHome();
                                }
                            },
                        ]
                    );
                }, 500);
            }
        }
    } catch (err: any) {
        Alert.alert(
            t('login.errorTitle'),
            err.message || t('login.errorMessage'),
            [{ text: 'OK' }]
        );
    }
};

    const loginWithBiometric = async () => {
    if (!biometricUserId) return;
    const credentials = await getBiometricCredentials(biometricUserId);
    if (!credentials) return;
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
        const resultAction = await dispatch(loginUser({
            login: credentials.login,
            password: credentials.password
        }));
        unwrapResult(resultAction);
        const userInfo = await dispatch(getUserInfo());
        const unwrappedUserInfo = unwrapResult(userInfo);
        connectWebSocket(unwrappedUserInfo.id);
        dispatch(setAuth(true)); // ← тут можно сразу, нет Alert
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "(tabs)" }] }));
    } catch (err: any) {
        Alert.alert(
            t('biometric.loginErrorTitle'),
            t('biometric.loginError'),
            [{ text: 'OK' }]
        );
    }
};

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? top : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        {/* Логотип + заголовок — анимированно сжимаются при открытии клавиатуры */}
                        <Center style={styles.header}>
                            <Animated.Image
                                source={require("@/assets/images/logo.png")}
                                style={[styles.logo, { width: logoSize, height: logoSize }]}
                            />
                            <Animated.Text
                                style={[
                                    textStyles.head24Medium,
                                    styles.welcomeText,
                                    { opacity: welcomeOpacity }
                                ]}
                            >
                                {t("login.welcome")}
                            </Animated.Text>
                        </Center>

                        {/* Форма */}
                        <Animated.View style={[styles.form, { marginTop: logoMarginBottom }]}>
                            <VStack space="xl">
                                <FormControl isRequired>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t("login.loginLabel")}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired
                                    >
                                        <InputField
                                            placeholder={t("login.loginPlaceholder")}
                                            value={login}
                                            onChangeText={setLogin}
                                            autoCapitalize="none"
                                            returnKeyType="next"
                                        />
                                    </Input>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t("login.passwordLabel")}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired
                                    >
                                        <InputField
                                            type={showPassword ? "text" : "password"}
                                            placeholder={t("login.passwordPlaceholder")}
                                            value={password}
                                            onChangeText={setPassword}
                                            returnKeyType="done"
                                            onSubmitEditing={logIn}
                                        />
                                        <InputSlot pr="$3" onPress={handleState}>
                                            <InputIcon
                                                as={showPassword ? EyeIcon : EyeOffIcon}
                                                color="$darkBlue500"
                                            />
                                        </InputSlot>
                                    </Input>
                                </FormControl>

                                <TouchableOpacity
                                    onPress={() => navigation.dispatch(StackActions.push("forgot-password"))}
                                    style={styles.forgotPassword}
                                >
                                    <Text style={[textStyles.body12Light, { color: Colors.greenFirst }]}>
                                        {t("login.forgotPassword")}
                                    </Text>
                                </TouchableOpacity>
                            </VStack>

                            {isBiometricSupported && isBiometricEnabled && (
                                <TouchableOpacity
                                    style={styles.biometricButton}
                                    onPress={loginWithBiometric}
                                >
                                    {Platform.OS === "ios" ? (
                                        <ScanFace size={40} color={Colors.grayDark} />
                                    ) : (
                                        <Fingerprint size={40} color={Colors.grayDark} />
                                    )}
                                    <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginTop: 8 }]}>
                                        {Platform.OS === "ios"
                                            ? t("biometric.faceIdButton")
                                            : t("biometric.touchIdButton")}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>

            {/* Кнопка входа — всегда над клавиатурой, не перекрывается */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: bottom + 16 }]}>
                <Button style={buttonStyles.activeFilledButton} width="100%" onPress={logIn}>
                    <ButtonText style={textStyles.body16Light} color={Colors.white}>
                        {t("login.submit")}
                    </ButtonText>
                </Button>
            </View>

            <LoadingOverlay loading={loading} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    scrollContent: {
        flexGrow: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 20,
    },
    header: {
        alignItems: 'center',
    },
    logo: {
        // размер задаётся через Animated.Value
    },
    welcomeText: {
        color: Colors.black,
        marginTop: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: 8,
    },
    bottomButtonContainer: {
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingTop: 12,        // ← прослойка между кнопкой и клавиатурой
        borderTopWidth: 1,     // ← визуальный сепаратор, уберите если не нужен
        borderTopColor: Colors.grayLight ?? '#E5E5E5',
    },
    biometricButton: {
        alignItems: "center",
        marginTop: 32,
        padding: 16,
    },
});

export default Page;