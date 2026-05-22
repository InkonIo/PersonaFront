import Colors from '@/constants/Colors';
import { Link, router, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { textStyles } from "@/constants/textStyles";
import {
    Button,
    ButtonText,
    ChevronDownIcon,
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAppSelector } from "@/store/hooks";
import * as React from "react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/constants/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const LANGUAGES = [
    { label: 'Русский', value: 'ru' },
    { label: 'English', value: 'en' },
    { label: 'Қазақша', value: 'kz' },
];

const Page = () => {
    const { t, i18n } = useTranslation();
    const { loading } = useAppSelector(state => state.user);
    const { bottom } = useSafeAreaInsets();
    const [selectedLang, setSelectedLang] = useState(i18n.language ?? 'ru');
    const { isAuthenticated, isInitialized } = useAppSelector(state => state.auth);

    useEffect(() => {
        console.log('📄 INDEX PAGE MOUNTED');
        return () => console.log('📄 INDEX PAGE UNMOUNTED');
    }, []);

    useEffect(() => {
        console.log('🔁 loading changed:', loading);
    }, [loading]);

    const handleLanguageChange = async (lang: string) => {
        setSelectedLang(lang);
        await changeLanguage(lang as 'ru' | 'en' | 'kz');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.topBar}>
                <StatusBar style="dark" hidden={false} />
                <Select
                    selectedValue={selectedLang}
                    onValueChange={handleLanguageChange}
                >
                    <SelectTrigger variant="outline" size="md" style={styles.langSelector}>
                        <SelectInput
                            placeholder={t('language.select')}
                            value={LANGUAGES.find(l => l.value === selectedLang)?.label}
                        />
                        <SelectIcon as={ChevronDownIcon} mr="$3" />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {LANGUAGES.map(lang => (
                                <SelectItem
                                    key={lang.value}
                                    label={lang.label}
                                    value={lang.value}
                                />
                            ))}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </SafeAreaView>

            <View style={styles.center}>
    <Image source={require("@/assets/images/logo.png")} style={styles.images} />
    <View style={styles.taglines}>
        <Text style={[textStyles.head24Medium, { color: '#50C878', marginTop: -15}]}>
    {t('welcome.tagline1')}
</Text>
<Text style={[textStyles.head24Medium, { color: Colors.black, marginTop: 22 }]}>
    {t('welcome.tagline2')}
</Text>
<Text style={[textStyles.head24Medium, { color: Colors.black, marginTop: 4 }]}>
    {t('welcome.tagline3')}
</Text>
    </View>
</View>

            <View style={[styles.buttons, { marginBottom: bottom }]}>
                <Link href='/login' asChild>
                    <Button style={buttonStyles.activeFilledButton} width="100%">
                        <ButtonText style={textStyles.body16Light} color={Colors.white}>
                            {t('auth.login')}
                        </ButtonText>
                    </Button>
                </Link>

                <Link href='/signup?mode=register' asChild>
                    <Button style={buttonStyles.activeStrokeButton} width="100%">
                        <ButtonText style={textStyles.body16Light} color={Colors.greenSecond}>
                            {t('auth.register')}
                        </ButtonText>
                    </Button>
                </Link>

                <Link href='/about' asChild>
                    <Button style={buttonStyles.activeTextButton} width="100%">
                        <ButtonText style={textStyles.body16Light} color={Colors.greenSecond}>
                            {t('auth.about')}
                        </ButtonText>
                    </Button>
                </Link>

                <Link href='/legal' asChild>
                    <Button style={buttonStyles.activeTextButton} width="100%">
                        <ButtonText style={textStyles.body16Light} color={Colors.greenSecond}>
                            {t('legal.title')}
                        </ButtonText>
                    </Button>
                </Link>
            </View>

            <LoadingOverlay loading={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topBar: {
        marginHorizontal: 20,
        marginTop: 50,
    },
    langSelector: {
        borderRadius: 12,
        backgroundColor: Colors.white,
    },
    images: {
        width: 128,
        height: 128,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    buttons: {
        gap: 15,
        paddingHorizontal: 16,
    },
    taglines: {
        alignItems: 'center',
        marginTop: 32,   // ← вот этот отступ решает проблему
    },
});

export default Page;