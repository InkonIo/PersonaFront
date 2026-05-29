import {
    Alert,
    FlatList,
    Platform,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    TextInput,
} from "react-native";
import {Image} from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
    Button,
    ButtonIcon,
    ButtonText,
    Center,
    ChevronDownIcon,
    EyeIcon,
    EyeOffIcon,
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
    Icon,
    Input,
    InputField,
    InputIcon,
    InputSlot,
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
    Text,
    VStack,
} from "@gluestack-ui/themed";
import {buttonStyles} from "@/constants/buttonStyles";
import ImageIcon from "@/assets/icons/ImageIcon";
import {textStyles} from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, {useEffect, useState, useRef} from "react";
import DeleteIcon from "@/assets/icons/Delete";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {editUser, getUserInfo, setImageUrl, setImageUrlForBackend, updateFormData, resetFormData, updateUserStatus} from "@/store/slices/usersSlice";
import { updateStatusOptimistic } from "@/store/slices/profileSlice";
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {StackActions} from "@react-navigation/native";
import {formatDate} from "@/utils/formatDate";
import {getAllDictionaryData, getCityByCountry, getLocalizedName, selectSortedCountries} from "@/store/slices/dictionarySlice";
import {AlertCircleIcon} from "lucide-react-native";
import ImageIconActive from "@/assets/icons/ImageIconActive";
import {userMapper} from "@/mappers/user-mapper";
import {uploadImage} from "@/store/slices/imageSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import {useTranslation} from 'react-i18next';
import {formatNumberWithSpaces} from "@/utils/formatNumberWithSpaces";
import SocialLinksInput from "@/components/SocialLinksInput";
import SocialLinksModal from "@/components/SocialLinksModal";
import SocialLinks from "@/components/SocialLinks";
import i18n from "@/constants/i18n";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CountryPickerModal from '@/components/CountryPickerModal';
import { XIcon } from "lucide-react-native";


// ─── Компонент списка стран с поиском ────────────────────────────────────────
const CountrySearch = ({ countries, onSelect }: { countries: any[], onSelect: (id: any) => void }) => {
    const [query, setQuery] = useState('');
    const {t} = useTranslation();

    const filtered = query.trim()
        ? countries.filter((c: any) =>
            getLocalizedName(c).toLowerCase().includes(query.toLowerCase())
          )
        : countries;


    return (
        <View style={{ width: '100%' }}>
            <View style={countrySearchStyles.searchContainer}>
                <TextInput
                    placeholder={t('signup.placeholder')}
                    value={query}
                    onChangeText={setQuery}
                    style={countrySearchStyles.searchInput}
                    placeholderTextColor={Colors.grayDark}
                    autoFocus={true}
                />
            </View>
            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 300 }}
                keyboardShouldPersistTaps="always"
                renderItem={({ item }) => (
                    <TouchableOpacity
                            onPress={() => onSelect(String(item.id))}
                            activeOpacity={0.6}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                        >
                        <Text style={{ fontSize: 14, color: '#000' }}>
                            {getLocalizedName(item)}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const countrySearchStyles = StyleSheet.create({
    searchContainer: {
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: Colors.grayDark,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    searchInput: {
        fontSize: 14,
        color: '#000',
    },
});
// ─────────────────────────────────────────────────────────────────────────────

const renderItem = ({item}: any) => (
    <SelectItem
        label={getLocalizedName(item)}
        value={item.id}
        key={item.id}
    />
)

const Page = () => {
    const {t} = useTranslation();

    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isEditModeRef = useRef(mode !== 'register');
    const isEditMode = isEditModeRef.current;

    const {
        cities,
        maritalStatus,
        professions,
        statuses,
        workFields,
        regions
    } = useAppSelector(state => state.dictionary)

    const lang = i18n.language;
    const countries = useAppSelector(state => selectSortedCountries(state, lang));

    const dispatch = useAppDispatch()
    const router = useRouter();
    const {userInfo, formData, imageUrl, loading, imageUrlForBackend} = useAppSelector(state => state.user)
    const {loading: imageLoading} = useAppSelector(state => state.image)
    const navigation = useNavigation();

    const [date, setDate] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)

    const MAX_DATE = new Date()
    const MIN_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 100))
    const [showPassword, setShowPassword] = useState(false)
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);
    const [countryModalVisible, setCountryModalVisible] = useState(false);

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const handleState = () => {
        setShowPassword((showState) => !showState)
    }

    const toggleDatePicker = () => {
        setShowPicker(!showPicker)
    }

    // ─── FIX: используем UTC-методы чтобы timezone не съедал день ────────────
    const onChange = ({type}: any, selectedDate: any) => {
    if (type === "set") {
        setDate(selectedDate)
        if (Platform.OS === "android") {
            toggleDatePicker()
        }
        const parts = selectedDate.toLocaleDateString('ru-RU').split('.');
        // ru-RU даёт формат DD.MM.YYYY
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        handleChange("dateOfBirth", `${day}-${month}-${year}`)
    } else {
        toggleDatePicker()
    }

}

const confirmIOSDate = () => {
    const parts = date.toLocaleDateString('ru-RU').split('.');
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    handleChange("dateOfBirth", `${day}-${month}-${year}`)
    toggleDatePicker()
}
    // ─────────────────────────────────────────────────────────────────────────

    const handleChange = (name: any, value: any) => {
        dispatch(updateFormData({name, value}))
    };

    const insets = useSafeAreaInsets();

    // ─── FIX: заполняем форму + синхронизируем стейт пикера с датой из профиля
    useEffect(() => {
    if (isEditMode && userInfo) {
        Object.entries(userInfo).forEach(([key, value]) => {
            // Пропускаем — обработаем через salary
            if (key === 'minDesiredIncome' || key === 'maxDesiredIncome') return;

            if (key === 'salary') {
                const salary = value as any;
                if (salary?.lower != null) {
                    handleChange('minDesiredIncome', formatNumberWithSpaces(String(parseInt(String(salary.lower), 10))));
                }
                if (salary?.upper != null) {
                    handleChange('maxDesiredIncome', formatNumberWithSpaces(String(parseInt(String(salary.upper), 10))));
                }
            } else {
                handleChange(key, value);
            }
        });

        // Восстанавливаем превью аватарки чтобы форма показывала текущее фото
        if (userInfo.imageUrl) {
            dispatch(setImageUrl(userInfo.imageUrl));
        }

        if (userInfo.dateOfBirth) {
            const [day, month, year] = userInfo.dateOfBirth.split('-').map(Number);
            if (day && month && year) {
                setDate(new Date(year, month - 1, day));
            }
        }
    }
}, [userInfo, isEditMode]);

    useEffect(() => {
        navigation.setOptions({
            title: isEditMode ? t('profile.editProfile') : t('signup.title')
        });
    }, [isEditMode]);

    // ← ДОБАВЬ ЭТО
    useEffect(() => {
        dispatch(getAllDictionaryData())
    }, [])

    const onChangeSelect = (name: string, value: any) => {
    let foundedOptions;

    if (name === "country") {
        foundedOptions = countries?.find((item: any) => item.id == value);
        dispatch(getCityByCountry(foundedOptions?.id));
    } else if (name === "fieldOfWork") {
        foundedOptions = workFields.find((item: any) => item.id === value);
    } else if (name === "status") {
        foundedOptions = statuses.find((item: any) => item.id === value);
    } else if (name === "maritalStatus") {
        foundedOptions = maritalStatus.find((item: any) => item.id === value);
    } else {
        foundedOptions = value; // fallback для остального
    }

    handleChange(name, foundedOptions);
};

    const handleImagePickerPress = async () => {
        try {
            if (Platform.OS === 'android') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('signup.uploadError'), t('signup.uploadErrorMsg'));
                    return;
                }
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
                
                const asset = result.assets[0];
                const localUri = asset.uri;

                const uriParts = localUri.split('.');
                const ext = uriParts[uriParts.length - 1].toLowerCase().split('?')[0];
                const mimeMap: Record<string, string> = {
                    jpg: 'image/jpeg',
                    jpeg: 'image/jpeg',
                    png: 'image/png',
                    gif: 'image/gif',
                    webp: 'image/webp',
                    heic: 'image/heic',
                    heif: 'image/heif',
                };
                const mimeType = mimeMap[ext] ?? 'image/jpeg';
                const filename = asset.fileName ?? `photo_${Date.now()}.${ext || 'jpg'}`;
                
                dispatch(setImageUrl(localUri));

                const formData: any = new FormData();
                formData.append("file", {
                    uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                    type: mimeType,
                    name: filename,
                });

                await dispatch(uploadImage(formData))
                    .unwrap()
                    .then((res: any) => {
                        dispatch(setImageUrlForBackend(res.imageUrl));
                    })
                    .catch(() => Alert.alert(
                        t('signup.uploadError'),
                        t('signup.uploadErrorMsg'),
                        [{
                            text: 'OK', onPress: () => {
                                dispatch(setImageUrl(""));
                                dispatch(setImageUrlForBackend(""));
                            }
                        }]
                    ));
            }
        } catch (err) {
            console.log("error", err);
            Alert.alert(t('signup.uploadError'), t('signup.uploadErrorMsg'));
        }
    };

    const onEdit = async () => {
    const isInvalid = (
        !formData.login
        || !formData.fullName
        || !formData.dateOfBirth
        || !formData.country?.name
        || !formData.city?.name
        || !formData.fieldOfWork?.name
        || !formData.email
        || !isValidEmail(formData.email)
        || !formData.professions?.length
        || !formData.linksToSocial
    );

    if (isInvalid) {
        setIsFormSubmitted(true);
        return;
    }

    setIsFormSubmitted(false);

    // Мгновенно обновляем UI
    if (formData.status && userInfo?.id) {
        dispatch(updateStatusOptimistic({ userId: userInfo.id, status: formData.status }));
    }

    const imageToSend = imageUrlForBackend || userInfo?.imageUrl || '';
    const user = userMapper(formData, imageToSend);

    // Два запроса параллельно
    const requests: Promise<any>[] = [dispatch(editUser(user)).unwrap()];
    if (formData.status?.id) {
        requests.push(dispatch(updateUserStatus(formData.status.id)).unwrap());
    }

    await Promise.all(requests)
        .then(() => {
            dispatch(resetFormData());
            dispatch(setImageUrl(""));
            router.back();
            // getUserInfo фоново — не блокируем
            dispatch(getUserInfo());
        })
        .catch((err: any) => {
            dispatch(getUserInfo());
            Alert.alert(
                t('signup.photoRequired'),
                err.message,
                [{ text: 'OK', onPress: () => console.log("123") }]
            );
        });
};

    const onSubmit = async () => {
        const isInvalid = (
            !formData.login
            || !formData.fullName
            || !formData.dateOfBirth
            || !formData.password
            || !formData.country?.name
            || !formData.city?.name
            || !formData.fieldOfWork?.name
            || !formData.email
            || !isValidEmail(formData.email)
            || !formData.linksToSocial
        );

        if (isInvalid) {
            setIsFormSubmitted(true);
            return;
        }

        if (!imageUrl) {
            Alert.alert(
                t('signup.photoRequired'),
                t('signup.photoRequiredMsg'),
                [{text: 'OK', onPress: () => console.log("123")}]
            );
            return;
        }

        setIsFormSubmitted(false);
        navigation.dispatch(StackActions.push("myAnket"));
    };

    const height = useHeaderHeight()

    const openCitiesPicker = () => {
    if (!formData.country?.name) {
        Alert.alert(
            t('signup.countryRequired'),
            t('signup.countryRequiredMsg'),
            [{text: 'OK', onPress: () => console.log("123")}]
        );
        return
    }
    navigation.dispatch(StackActions.push("citiesOrRegions", { 
        fromWhere: isEditMode ? "EDIT" : "REGISTRATION",
        countryId: formData.country?.id   // ← добавил это
    }))
}

    const openProfessionsPicker = () => {
        navigation.dispatch(StackActions.push("professions", { fromWhere: "REGISTRATION" }))
    }

    const openFieldOfWorkPicker = () => {
        navigation.dispatch(StackActions.push("fieldOfWork", { fromWhere: "REGISTRATION" }))
    }

    const handleSocialLinksPress = () => {
        router.push('/social-links');
    };

    return (
        <View style={{flex: 1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{flex: 1}}
                enabled
                keyboardVerticalOffset={height + 47}
            >
                <SafeAreaView style={{flex: 1}}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 16}}>
                        <View style={styles.container}>
                            <Button
                                style={isEditMode && userInfo?.imageUrl ? buttonStyles.activeFilledButton : buttonStyles.activeStrokeButton}
                                onPress={handleImagePickerPress}>
                                <ButtonText style={[textStyles.body16Light, {marginRight: 8}]}
                                            color={isEditMode && userInfo?.imageUrl ? Colors.white : Colors.greenSecond}>
                                    {isEditMode && userInfo?.imageUrl ? t('signup.changePhoto') : imageUrl ? t('signup.photoAdded') : t('signup.addPhoto')}
                                </ButtonText>
                                <ButtonIcon as={isEditMode && userInfo?.imageUrl ? ImageIconActive : ImageIcon}/>
                            </Button>
                            <View style={{position: 'relative', marginTop: imageUrl ? 20 : 0}}>
                                <Center>
                                    {imageUrl && <Image source={imageUrl} style={styles.image}/>}
                                    {imageUrl && (
                                        <View style={styles.iconContainer}>
                                            <TouchableOpacity>
                                                <DeleteIcon onPress={() => dispatch(setImageUrl(""))}/>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Center>
                            </View>
                            <View style={styles.form}>
                                <VStack space="xl">
                                    {/* ─── Логин ─── */}
                                    <FormControl isRequired={true} isInvalid={!formData.login && isFormSubmitted}
                                                 isDisabled={isEditMode}>
                                        <VStack space="xs">
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.login')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                                <InputField
                                                    placeholder={t('signup.placeholder')}
                                                    value={formData.login}
                                                    maxLength={50}
                                                    onChangeText={(text) => handleChange("login", text)}
                                                />
                                            </Input>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.loginRequired')}</FormControlErrorText>
                                            </FormControlError>
                                        </VStack>
                                    </FormControl>

                                    {/* ─── Пароль ─── */}
                                    <VStack space="xs">
                                        <FormControl
                                            isRequired={true}
                                            isInvalid={isEditMode ? false : !formData.password && isFormSubmitted}
                                            isDisabled={isEditMode}
                                        >
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.password')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    type={showPassword ? "text" : "password"} placeholder="•••••••"
                                                    value={formData.password}
                                                    maxLength={50}
                                                    onChangeText={(text) => handleChange("password", text)}
                                                />
                                                <InputSlot pr="$3" onPress={handleState}>
                                                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} color="$darkBlue500"/>
                                                </InputSlot>
                                            </Input>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.passwordRequired')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Полное имя ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={!formData.fullName && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.fullName')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    placeholder={t('signup.placeholder')}
                                                    value={formData.fullName}
                                                    maxLength={50}
                                                    onChangeText={(text) => handleChange("fullName", text)}
                                                />
                                            </Input>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.fullNameRequired')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Дата рождения ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={!formData.dateOfBirth && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.dateOfBirth')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            {showPicker && (
                                                <DateTimePicker
                                                    mode="date"
                                                    display="spinner"
                                                    value={date}
                                                    onChange={onChange}
                                                    style={styles.datePicker}
                                                    themeVariant="light"
                                                    locale={i18n.language === 'en' ? 'en-US' : i18n.language === 'kz' ? 'kk-KZ' : 'ru-RU'}
                                                    is24Hour={false}
                                                    maximumDate={MAX_DATE}
                                                    minimumDate={MIN_DATE}
                                                />
                                            )}
                                            {showPicker && Platform.OS === "ios" && (
                                                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                                                    <TouchableOpacity onPress={toggleDatePicker}>
                                                        <Text>{t('signup.cancel')}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={confirmIOSDate}>
                                                        <Text>{t('signup.done')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {!showPicker && (
                                                <Pressable onPress={toggleDatePicker}>
                                                    <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                        <InputField
                                                            placeholder={t('signup.selectDate')}
                                                            editable={false}
                                                            value={formData.dateOfBirth}
                                                            onPressIn={toggleDatePicker}
                                                        />
                                                    </Input>
                                                    <FormControlError>
                                                        <FormControlErrorIcon as={AlertCircleIcon}/>
                                                        <FormControlErrorText>{t('signup.dateRequired')}</FormControlErrorText>
                                                    </FormControlError>
                                                </Pressable>
                                            )}
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Страна ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={!formData.country?.name && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.country')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <CountryPickerModal
    countries={countries}
    selectedCountry={formData.country}
    lang={lang}
    onSelect={(id: string) => onChangeSelect("country", id)}
    onClear={() => { handleChange("country", null); handleChange("city", null); }}
/>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.countryError')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Город ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={!formData.city?.name && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.city')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Select selectedValue={!isEditMode && formData.city === null && formData.allRegions ? t('common.allRegions') : getLocalizedName(formData.city)} onOpen={openCitiesPicker}>
                                                <SelectTrigger variant="rounded" size="md">
                                                    <SelectInput placeholder={t('signup.selectFromList')}/>
                                                    {formData.city ? (
    <TouchableOpacity onPress={() => handleChange("city", null)} style={{ paddingRight: 12 }}>
        <InputIcon as={XIcon} />
    </TouchableOpacity>
) : (
    <SelectIcon as={ChevronDownIcon} mr="$3"/>
)}
                                                </SelectTrigger>
                                            </Select>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.cityError')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Сфера деятельности ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={!formData.fieldOfWork?.name && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.fieldOfWork')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Select selectedValue={getLocalizedName(formData.fieldOfWork)} onOpen={openFieldOfWorkPicker}>
                                                <SelectTrigger variant="rounded" size="md">
                                                    <SelectInput placeholder={t('signup.selectFromList')}/>
                                                    {formData.fieldOfWork ? (
    <TouchableOpacity onPress={() => handleChange("fieldOfWork", null)} style={{ paddingRight: 12 }}>
        <InputIcon as={XIcon} />
    </TouchableOpacity>
) : (
    <SelectIcon as={ChevronDownIcon} mr="$3"/>
)}
                                                </SelectTrigger>
                                            </Select>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.fieldError')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Профессия ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={!formData.professions?.length && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.profession')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Select
                                                selectedValue={formData.professions?.length
                                                    ? formData.professions.map((p: any) => getLocalizedName(p)).join(", ")
                                                    : null}
                                                onOpen={openProfessionsPicker}
                                            >
                                                <SelectTrigger variant="rounded" size="md">
                                                    <SelectInput placeholder={t('signup.selectFromList')}/>
                                                    {formData.professions?.length ? (
    <TouchableOpacity onPress={() => handleChange("professions", [])} style={{ paddingRight: 12 }}>
        <InputIcon as={XIcon} />
    </TouchableOpacity>
) : (
    <SelectIcon as={ChevronDownIcon} mr="$3"/>
)}
                                                </SelectTrigger>
                                            </Select>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.fieldError')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Email ─── */}
                                    <VStack space="xs">
                                        <FormControl isRequired={true} isInvalid={(!formData.email || !isValidEmail(formData.email)) && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.email')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    placeholder="example@mail.com"
                                                    value={formData.email}
                                                    maxLength={100}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    onChangeText={(text) => {
                                                        const cleaned = text.replace(/[^a-zA-Z0-9@._+\-]/g, '');
                                                        handleChange("email", cleaned);
                                                    }}
                                                />
                                            </Input>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>
                                                    {!formData.email ? t('signup.emailRequired') : t('signup.emailInvalid')}
                                                </FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Соцсети ─── */}
                                    <VStack space="xs">
                                        <FormControl isInvalid={!formData.linksToSocial && isFormSubmitted}>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.socialLinks')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Button variant="outline" onPress={handleSocialLinksPress} style={{width: '100%'}}>
                                                <ButtonText style={[textStyles.body16Light, {color: Colors.grayDark}]}>
                                                    {t('signup.manageSocialLinks')}
                                                </ButtonText>
                                            </Button>
                                            <FormControlError>
                                                <FormControlErrorIcon as={AlertCircleIcon}/>
                                                <FormControlErrorText>{t('signup.socialLinksRequired')}</FormControlErrorText>
                                            </FormControlError>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Семейное положение ─── */}
                                    <VStack space="xs">
                                        <FormControl>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.maritalStatus')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Select selectedValue={getLocalizedName(formData.maritalStatus)}
                                                    onValueChange={value => onChangeSelect("maritalStatus", value)}>
                                                <SelectTrigger variant="rounded" size="md">
                                                    <SelectInput placeholder={t('signup.selectFromList')}/>
                                                    {formData.maritalStatus ? (
    <TouchableOpacity onPress={() => handleChange("maritalStatus", null)} style={{ paddingRight: 12 }}>
        <InputIcon as={XIcon} />
    </TouchableOpacity>
) : (
    <SelectIcon as={ChevronDownIcon} mr="$3"/>
)}
                                                </SelectTrigger>
                                                <SelectPortal>
                                                    <SelectBackdrop/>
                                                    <SelectContent>
                                                        <SelectDragIndicatorWrapper>
                                                            <SelectDragIndicator/>
                                                        </SelectDragIndicatorWrapper>
                                                        <FlatList
                                                            data={maritalStatus}
                                                            renderItem={renderItem}
                                                            keyExtractor={item => item.id}
                                                            style={{width: '100%'}}
                                                        />
                                                    </SelectContent>
                                                </SelectPortal>
                                            </Select>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Образование ─── */}
                                    <VStack space="xs">
                                        <FormControl>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.education')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    placeholder={t('signup.placeholder')}
                                                    value={formData.educationAndCourses}
                                                    maxLength={200}
                                                    onChangeText={(text) => handleChange("educationAndCourses", text)}
                                                />
                                            </Input>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Опыт ─── */}
                                    <VStack space="xs">
                                        <FormControl>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.experience')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    placeholder={t('signup.placeholder')}
                                                    value={formData.experienceAndSkills}
                                                    maxLength={200}
                                                    onChangeText={(text) => handleChange("experienceAndSkills", text)}
                                                />
                                            </Input>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Желаемый доход ─── */}
                                    <VStack space="xs">
                                        <FormControl>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.desiredIncome')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <View style={styles.inputGroup}>
                                                <View style={{flex: 1}}>
                                                    <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                        <InputField
                                                            inputMode="numeric"
                                                            placeholder={t('signup.from')}
                                                            value={formData.minDesiredIncome}
                                                            maxLength={15}
                                                            onChangeText={(text) => {
                                                                const clean = text.replace(/[^0-9]/g, '');
                                                                const num = clean ? String(parseInt(clean, 10)) : '';
                                                                handleChange("minDesiredIncome", formatNumberWithSpaces(num));
                                                            }}
                                                        />
                                                    </Input>
                                                </View>
                                                <View style={{flex: 1, marginLeft: 8}}>
                                                    <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                        <InputField
                                                            inputMode="numeric"
                                                            placeholder={t('signup.to')}
                                                            value={formData.maxDesiredIncome}
                                                            maxLength={15}
                                                            onChangeText={(text) => {
                                                                const clean = text.replace(/[^0-9]/g, '');
                                                                const num = clean ? String(parseInt(clean, 10)) : '';
                                                                handleChange("maxDesiredIncome", formatNumberWithSpaces(num));
                                                            }}
                                                        />
                                                    </Input>
                                                </View>
                                            </View>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Работа мечты ─── */}
                                    <VStack space="xs">
                                        <FormControl>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.dreamJob')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    placeholder={t('signup.placeholder')}
                                                    value={formData.dreamWork}
                                                    maxLength={200}
                                                    onChangeText={(text) => handleChange("dreamWork", text)}
                                                />
                                            </Input>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Хобби ─── */}
                                    <VStack space="xs">
                                        <FormControl>
                                            <FormControlLabel>
                                                <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                                    {t('signup.hobby')}
                                                </FormControlLabelText>
                                            </FormControlLabel>
                                            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} isRequired={true}>
                                                <InputField
                                                    placeholder={t('signup.placeholder')}
                                                    value={formData.hobby}
                                                    maxLength={200}
                                                    onChangeText={(text) => handleChange("hobby", text)}
                                                />
                                            </Input>
                                        </FormControl>
                                    </VStack>

                                    {/* ─── Статус ─── */}
<VStack space="xs">
    <FormControl isDisabled={true}>
        <FormControlLabel>
            <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                {t('home.status')}
            </FormControlLabelText>
        </FormControlLabel>
        <Select
            selectedValue={formData.status ? getLocalizedName(formData.status) : null}
            isDisabled={true}
        >
            <SelectTrigger variant="rounded" size="md">
                <SelectInput placeholder={t('signup.selectFromList')} />
                <SelectIcon as={ChevronDownIcon} mr="$3"/>
                {/* крестик убираем — юзер не может менять */}
            </SelectTrigger>
            <SelectPortal>
                {/* ...содержимое можно оставить или убрать — всё равно не откроется */}
            </SelectPortal>
        </Select>
    </FormControl>
</VStack>
                                </VStack>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>


            {/* Кнопка СНАРУЖИ KeyboardAvoidingView — клавиатура её не двигает */}
            <View style={[styles.bottomButtonContainer, {paddingBottom: Math.max(insets.bottom, 16)}]}>
                {isEditMode ? (
                    <Button style={[buttonStyles.activeFilledButton]} onPress={onEdit}>
                        <ButtonText style={[textStyles.body16Light, {color: Colors.white}]}>
                            {t('signup.edit')}
                        </ButtonText>
                    </Button>
                ) : (
                    <Button style={[buttonStyles.activeFilledButton]} onPress={onSubmit}>
                        <ButtonText style={[textStyles.body16Light, {color: Colors.white}]}>
                            {t('signup.preview')}
                        </ButtonText>
                    </Button>
                )}
            </View>
            <LoadingOverlay loading={loading || imageLoading}/>
        </View>
    )
}

const styles = StyleSheet.create({

    
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 80,
    },
       bottomButtonContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    iconContainer: {
        position: 'absolute',
        top: -6,
        left: 238,
    },
    image: {
        width: 128,
        height: 128,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "row"
    },
    form: {
        marginTop: 16,
        marginBottom: 16,
    },
    datePicker: {
        height: 120,
        marginTop: -10,
    },
})

export default Page