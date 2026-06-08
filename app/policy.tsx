import {View, Text, StyleSheet, ScrollView, Alert, useWindowDimensions} from "react-native";
import {textStyles} from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import {
    Button,
    ButtonText,
    Checkbox,
    CheckboxIcon,
    CheckboxIndicator,
    CheckboxLabel,
    CheckIcon
} from "@gluestack-ui/themed";
import {buttonStyles} from "@/constants/buttonStyles";
import {useState} from "react";
import {useRouter} from "expo-router";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {userMapper} from "@/mappers/user-mapper";
import {createNewUser, getUserInfo, loginUser} from "@/store/slices/usersSlice";
import {unwrapResult} from "@reduxjs/toolkit";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import {useTranslation} from "react-i18next";
import {TouchableOpacity} from "react-native";
import ErrorModal from '@/components/ErrorModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocket } from '@/app/WebSocketContext';
import { setAuth } from '@/store/slices/authSlice';

const Page = () => {
    const {t} = useTranslation();
    const { height } = useWindowDimensions();
    const {formData, imageUrlForBackend, loading} = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const { connectWebSocket } = useWebSocket();

    const handleScroll = (event: any) => {
        const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 16;
        if (isEnd && !isScrolledToEnd) setIsScrolledToEnd(true);
    };

    // замени createUser целиком
const createUser = async () => {
    const user = userMapper(formData, imageUrlForBackend);
    try {
        const resultAction = await dispatch(createNewUser(user));
        const userData = unwrapResult(resultAction);

        if (userData) {
            const { login, password } = user;
            const loginResultAction = await dispatch(loginUser({ login, password }));
            const credentials = unwrapResult(loginResultAction);

            if (credentials) {
                const userInfoResultAction = await dispatch(getUserInfo());
                const userInfoData = unwrapResult(userInfoResultAction);

                if (userInfoData) {
                    await AsyncStorage.removeItem('userInitiatedLogout');
                    connectWebSocket(userInfoData.id);
                    dispatch(setAuth(true));
                }
            }
        }
    } catch (err: any) {

    console.log('🔴 createUser error FULL:', JSON.stringify(err, null, 2));
    console.log('🔴 err.message:', err?.message);
    console.log('🔴 err.error:', err?.error);
    console.log('🔴 err.status:', err?.status);
        const errorMessage = err?.message || err?.error || '';
        
        // Игнорируем ошибки валидации города/страны — бэк уже не требует
        const ignoredErrors = ['город не указан', 'city', 'country', 'страна'];
        const isIgnored = ignoredErrors.some(e => 
            errorMessage.toLowerCase().includes(e.toLowerCase())
        );
        
        if (!isIgnored) {
            setErrorModal({ visible: true, message: errorMessage || t('common.errorMessage') });
        }
    }
};

    const insets = useSafeAreaInsets();
    const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string; title?: string } | null>(null);

    // Единственное изменение: динамическая высота вместо захардкоженных 400px
    const policyMaxHeight = Math.min(height * 0.45, 400);

    return (
        <View style={styles.container}>
            <View style={styles.center}>
                <Text style={[textStyles.head24Medium, {color: Colors.black2}]}>
                    {t('policy.beforeStart')}
                </Text>
                <Text style={[textStyles.body16Light, {color: Colors.black2, marginTop: 16}]}>
                    {t('policy.readPolicy')}
                </Text>

                <View style={[styles.policyContainer, { maxHeight: policyMaxHeight }]}>
                    <ScrollView
                        style={styles.policy}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        <View style={{paddingBottom: 50}}>
                            <Text style={[textStyles.body16Light, {color: Colors.text, textAlign: "center"}]}>
                                {t('policy.appName')}
                            </Text>
                            <Text style={[textStyles.body16Light, {color: Colors.text}]}>
                                {t('policy.introTitle')}
                            </Text>
                            <Text style={[textStyles.body16Light, {color: Colors.text}]}>{t('policy.introText')}{"\n"}</Text>
                            <Text style={[textStyles.body16Light, {color: Colors.text}]}>{t('policy.section1')}{"\n"}</Text>
                            <Text style={[textStyles.body16Light, {color: Colors.text}]}>{t('policy.section2')}{"\n"}</Text>
                            <Text style={[textStyles.body16Light, {color: Colors.text}]}>{t('policy.section4')}{"\n"}</Text>
                            <Text style={[textStyles.body16Light, {color: Colors.text}]}>
                                {t('policy.section5')}{"\n\n"}
                                {t('policy.contactTitle')}{"\n"}
                                {t('policy.contactText')} <Text style={{color: "green"}}>DPO@Persona.com.</Text> {t('policy.contactTextEnd')}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* ─── Чекбокс — большая кликабельная область ─────────── */}
                    <TouchableOpacity
                        style={[
                            styles.checkboxRow,
                            !isScrolledToEnd && styles.checkboxRowDisabled,
                        ]}
                        onPress={() => {
                            if (isScrolledToEnd) setIsCheckboxChecked(prev => !prev);
                        }}
                        activeOpacity={isScrolledToEnd ? 0.6 : 1}
                    >
                        <View style={[
                            styles.checkboxBox,
                            isCheckboxChecked && styles.checkboxBoxChecked,
                            !isScrolledToEnd && styles.checkboxBoxDisabled,
                        ]}>
                            {isCheckboxChecked && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                        <Text style={[
                            textStyles.body16Light,
                            styles.checkboxLabel,
                            !isScrolledToEnd && {color: Colors.grayDark + '80'},
                        ]}>
                            {t('policy.acknowledged')}
                        </Text>
                    </TouchableOpacity>

                    {/* Подсказка если ещё не доскроллил */}
                    {!isScrolledToEnd && (
                        <Text style={styles.scrollHint}>
                            ↓ {t('policy.readPolicy')}
                        </Text>
                    )}
                </View>
            </View>

            <View style={[styles.buttonButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
                <Button
                    onPress={createUser}
                    style={[buttonStyles.activeFilledButton, {marginLeft: 16, marginRight: 16, marginBottom: 20}]}
                    isDisabled={!isCheckboxChecked}
                >
                    <ButtonText style={[textStyles.body16Light, {color: Colors.white}]}>
                        {t('policy.continue')}
                    </ButtonText>
                </Button>
            </View>

            <ErrorModal
                visible={!!errorModal?.visible}
                title={errorModal?.title}
                message={errorModal?.message ?? ''}
                errorType="validation_error"
                onClose={() => setErrorModal(null)}
            />

            <LoadingOverlay loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    policyContainer: {
        maxWidth: 340,
        marginTop: 16,
    },
    policy: {
        backgroundColor: Colors.grayLight,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 4,
        minHeight: 48,
    },
    checkboxRowDisabled: {
        opacity: 0.5,
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.greenFirst,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    checkboxBoxChecked: {
        backgroundColor: Colors.greenFirst,
        borderColor: Colors.greenFirst,
    },
    checkboxBoxDisabled: {
        borderColor: Colors.grayDark,
    },
    checkmark: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 18,
    },
    checkboxLabel: {
        color: Colors.grayDark,
        marginLeft: 12,
        flex: 1,
    },
    scrollHint: {
        fontSize: 12,
        color: Colors.grayDark,
        textAlign: 'center',
        marginTop: 4,
        opacity: 0.6,
    },
    buttonButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 13,
        borderTopWidth: 1,
        borderTopColor: 'gray',
    },
});

export default Page;