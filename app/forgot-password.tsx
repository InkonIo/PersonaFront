import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Platform, Alert,
    KeyboardAvoidingView, ScrollView, TouchableOpacity,
} from 'react-native';
import {
    Button, ButtonText, FormControl, FormControlLabel,
    FormControlLabelText, Input, InputField,
    InputIcon, InputSlot, EyeIcon, EyeOffIcon, VStack,
} from '@gluestack-ui/themed';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { textStyles } from '@/constants/textStyles';
import { buttonStyles } from '@/constants/buttonStyles';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const BASE_URL = 'http://91.224.74.12:8080';

const Page = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { bottom } = useSafeAreaInsets();

    const [step, setStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendCode = async () => {
        if (!email.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/public/users/password-reset/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            Alert.alert(t('forgotPassword.successTitle'), t('forgotPassword.codeSent'));
            setStep('code');
        } catch (err: any) {
            Alert.alert(t('forgotPassword.errorTitle'), err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmReset = async () => {
        if (!code.trim() || !newPassword.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/public/users/password-reset/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            Alert.alert(t('forgotPassword.successTitle'), t('forgotPassword.successMessage'), [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert(t('forgotPassword.errorTitle'), err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                <VStack space="xl" style={styles.form}>
                    {/* Email — всегда показываем */}
                    <FormControl isRequired>
                        <FormControlLabel>
                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                {t('forgotPassword.emailLabel')}
                            </FormControlLabelText>
                        </FormControlLabel>
                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}
                            isDisabled={step === 'code'}>
                            <InputField
                                placeholder={t('forgotPassword.emailPlaceholder')}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </Input>
                    </FormControl>

                    {step === 'email' && (
                        <Button style={buttonStyles.activeFilledButton} onPress={sendCode} isDisabled={!email.trim()}>
                            <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>
                                {t('forgotPassword.sendCode')}
                            </ButtonText>
                        </Button>
                    )}

                    {step === 'code' && (
                        <>
                            <FormControl isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t('forgotPassword.codeLabel')}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t('forgotPassword.codePlaceholder')}
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </Input>
                            </FormControl>

                            <FormControl isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t('forgotPassword.newPasswordLabel')}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t('forgotPassword.newPasswordPlaceholder')}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                    <InputSlot pr="$3" onPress={() => setShowPassword(s => !s)}>
                                        <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} color="$darkBlue500" />
                                    </InputSlot>
                                </Input>
                            </FormControl>

                            {/* Отправить код повторно */}
                            <TouchableOpacity onPress={() => { setStep('email'); setCode(''); setNewPassword(''); }}>
                                <Text style={[textStyles.body12Light, { color: Colors.greenFirst, textAlign: 'center' }]}>
                                    {t('forgotPassword.sendCode')} →
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </VStack>
            </ScrollView>

            {step === 'code' && (
                <View style={[styles.bottom, { paddingBottom: bottom + 8 }]}>
                    <Button
                        style={buttonStyles.activeFilledButton}
                        onPress={confirmReset}
                        isDisabled={!code.trim() || !newPassword.trim()}
                    >
                        <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>
                            {t('forgotPassword.confirm')}
                        </ButtonText>
                    </Button>
                </View>
            )}

            <LoadingOverlay loading={loading} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.white },
    scroll: { flexGrow: 1, padding: 16, paddingTop: 24 },
    form: { flex: 1 },
    bottom: {
        paddingHorizontal: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.grayLight,
        backgroundColor: Colors.white,
    },
});

export default Page;