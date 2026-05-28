import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Share,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import Chips from "@/components/Chips";
import Stars from "@/components/Stars";
import {
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    Textarea,
    TextareaInput,
    VStack,
} from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ShareIcon from "@/assets/icons/ShareIcon";
import { getUserInfoById, clearUserInfoById } from "@/store/slices/profileSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCorrectRatingWord } from "@/app/helpers";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from 'react-i18next';
import { useNavigationState } from '@react-navigation/native';
import UserAvatar from '@/components/UserAvatar';


const getLocalizedField = (obj: any, lang: string): string => {
    if (!obj) return '';
    if (lang === 'ru') return obj.nameRu ?? obj.name ?? '';
    if (lang === 'kz') return obj.nameKz ?? obj.name ?? '';
    return obj.nameEn ?? obj.name ?? '';
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { display: "flex", flexDirection: "row", paddingHorizontal: 16, paddingVertical: 16 },
    images: { width: 128, height: 128, borderRadius: 20 },
    imageWrapper: { width: "40%" },
    personInfo: { width: "60%" },
    form: { marginTop: 16, marginBottom: 16, marginHorizontal: 16 },
    inputGroup: { display: "flex", flexDirection: "row" },
});

const Page = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const navigation = useNavigation();
    const router = useRouter();

    const { id } = useLocalSearchParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const { userInfoById, loading } = useAppSelector(state => state.profile);
    const { isAuthenticated, isInitialized, isLoggingOut } = useAppSelector(state => state.auth);
    const userInfo = useAppSelector(state => state.user.userInfo);
    const isOwnProfile = userInfo?.id === Number(id);
    const [isHidden, setIsHidden] = useState(false);

    const canGoBack = useNavigationState(state => {
        if (!state) return false;
        const routes = state.routes;
        return routes.length > 1 || state.index > 0;
    });

    const handleShare = useCallback(async () => {
        try {
            await Share.share({ message: `https://personabest.com/user/${id}` });
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        }
    }, [id, t]);

    // Загрузка профиля — для всех, авторизован или нет
    useEffect(() => {
        if (!id) return;
        if (!isInitialized) return;
        if (isLoggingOut) return;

        setIsHidden(false);
        dispatch(clearUserInfoById());
        dispatch(getUserInfoById(id))
            .unwrap()
            .catch((err) => {
                if (err?.message === 'Пользователь не найден') {
                    setIsHidden(true);
                }
            });
    }, [id, isInitialized, isLoggingOut]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: t('userProfile.title'),
            headerBackTitle: t('common.back'),
            headerLeft: !canGoBack
                ? () => (
                    <TouchableOpacity
                        onPress={() => router.replace(isAuthenticated ? '/(tabs)/home' : '/')}
                        style={{ marginLeft: 16, paddingVertical: 4 }}
                    >
                        <Text style={{ color: Colors.greenSecond, fontSize: 16 }}>
                            {t('common.back')}
                        </Text>
                    </TouchableOpacity>
                )
                : undefined,
            headerRight: () => (
                <TouchableOpacity onPress={handleShare} style={{ marginRight: 16 }}>
                    <ShareIcon />
                </TouchableOpacity>
            ),
        });
    }, [handleShare, canGoBack, t, isAuthenticated]);

    const countryLabel = getLocalizedField(userInfoById?.country, lang);
    const cityLabel    = getLocalizedField(userInfoById?.city, lang);
    const locationText = [countryLabel, cityLabel].filter(Boolean).join(', ');

    if (isHidden && !loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
                <Text style={[textStyles.body20Medium, { color: Colors.text, textAlign: 'center', marginBottom: 12 }]}>
                    🔒
                </Text>
                <Text style={[textStyles.body20Medium, { color: Colors.text, textAlign: 'center', marginBottom: 8 }]}>
                    {t('userProfile.hiddenTitle')}
                </Text>
                <Text style={[textStyles.body16Light, { color: Colors.grayDark, textAlign: 'center' }]}>
                    {t('userProfile.hiddenMessage')}
                </Text>
                {!canGoBack && (
                    <TouchableOpacity
                        onPress={() => router.replace(isAuthenticated ? '/(tabs)/home' : '/')}
                        style={{ marginTop: 24 }}
                    >
                        <Text style={{ color: Colors.greenSecond, fontSize: 16 }}>
                            ← {t('common.back')}
                        </Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            {(loading || !userInfoById || userInfoById.id !== Number(id)) ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.greenSecond} />
                </View>
            ) : (
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView>
                        <View style={styles.card}>
                            <View style={styles.imageWrapper}>
                                <UserAvatar uri={userInfoById.imageUrl} style={styles.images} />
                                <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginTop: 8, marginLeft: 10 }]}>
                                    {`${userInfoById.days} ${t('home.daysInProject')}`}
                                </Text>
                            </View>
                            <View style={styles.personInfo}>
                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                    <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginRight: 4 }]}>
                                        ID: {userInfoById.id}
                                    </Text>
                                    {userInfoById.hasSubscription &&
                                        <Image source={require("@/assets/images/premiumUser.png")} style={{ width: 43, height: 10 }} />}
                                </View>
                                <Text style={[textStyles.body16Medium, { color: Colors.text, marginTop: 8 }]}>
                                    {`${userInfoById.fullName}, ${userInfoById.age}`}
                                </Text>
                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 4 }}>
    <Text style={[textStyles.body12Light, { color: Colors.text }]}>{t('home.status')}:</Text>
    <Chips
        case="fill"
        text={userInfoById.status ? getLocalizedField(userInfoById.status, lang) : t('userProfile.notSet')}
        style={{ marginLeft: 8, flex: 1 }}
    />
</View>
                                <Text style={[textStyles.body12Light, { color: Colors.text, marginTop: 8 }]}>
                                    {`${t('home.rating')}: ${userInfoById.rating}% (${userInfoById.ratingCount} ${getCorrectRatingWord(userInfoById.ratingCount, t, lang)})`}
                                </Text>
                                {locationText ? (
                                    <Text style={[textStyles.body12Light, { color: Colors.text, marginTop: 8 }]}>
                                        {locationText}
                                    </Text>
                                ) : null}
                                <Stars
                                    key={`view-${userInfoById.id}`}
                                    initialRating={(userInfoById.rating ?? 0) / 10}
                                    disabled={true}
                                />
                                {userInfoById.isMentor && (
                                    <Button style={[buttonStyles.activeStrokeButton, { height: 30 }]} marginTop={8}>
                                        <ButtonText style={[textStyles.body12Light, { color: Colors.greenSecond }]}>
                                            {t('home.mentor')}
                                        </ButtonText>
                                    </Button>
                                )}
                            </View>
                        </View>

                        {/* Кнопка написать — только для авторизованных, на чужом профиле */}
                        {isAuthenticated && !isOwnProfile && (
                            <Button
                                style={[buttonStyles.activeFilledButton, { marginHorizontal: 16 }]}
                                onPress={() => router.push(`/chat/${id}` as any)}
                            >
                                <ButtonText>{t('common.write')}</ButtonText>
                            </Button>
                        )}

                        <View style={styles.form}>
                            <VStack space="xl">
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.country')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={getLocalizedField(userInfoById.country, lang)} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.city')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={getLocalizedField(userInfoById.city, lang)} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.fieldOfWork')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={getLocalizedField(userInfoById.workField, lang)} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.profession')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Textarea variant="default" size="md" borderWidth={1} borderColor={Colors.grayDark} height="auto">
                                            <TextareaInput value={userInfoById.professions?.map((p: any) => getLocalizedField(p, lang)).join("\n")} />
                                        </Textarea>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.maritalStatus')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={getLocalizedField(userInfoById.maritalStatus, lang) || t('userProfile.notSpecified')} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.education')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={userInfoById.education ?? t('userProfile.notSpecified')} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.experience')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Textarea size="md" borderWidth={1} borderColor={Colors.grayDark} height="auto">
                                            <TextareaInput value={userInfoById.skills ?? t('userProfile.notSpecified')} />
                                        </Textarea>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <FormControlLabel>
                                        <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                            {t('signup.desiredIncome')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <View style={styles.inputGroup}>
                                        <View style={{ flex: 1 }}>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                                <InputField value={userInfoById.salaryFrom ? String(userInfoById.salaryFrom) : t('userProfile.notSpecified')} />
                                            </Input>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                                <InputField value={userInfoById.salaryTo ? String(userInfoById.salaryTo) : t('userProfile.notSpecified')} />
                                            </Input>
                                        </View>
                                    </View>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.dreamJob')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={userInfoById.dreamWork ?? t('userProfile.notSpecified')} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.hobby')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField value={userInfoById.hobby ?? t('userProfile.notSpecified')} />
                                        </Input>
                                    </VStack>
                                </FormControl>
                                <FormControl isDisabled>
                                    <VStack space="xs">
                                        <FormControlLabel>
                                            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                {t('signup.socialLinks')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        {userInfoById.socialLinks ? (
                                            <SocialLinks links={userInfoById.socialLinks} />
                                        ) : (
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                                <InputField value={t('userProfile.notSpecified')} />
                                            </Input>
                                        )}
                                    </VStack>
                                </FormControl>
                            </VStack>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            )}
        </View>
    );
};

export default Page;