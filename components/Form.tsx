import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList,
    Keyboard,
} from 'react-native';
import {
    ChevronDownIcon,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    Select,
    SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput, SelectItem,
    SelectPortal,
    SelectTrigger,
    VStack
} from "@gluestack-ui/themed";
import * as React from "react";
import {textStyles} from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {updateSearchFields} from "@/store/slices/homeSlice";
import {StackActions} from "@react-navigation/native";
import {useNavigation} from "expo-router";
import {getCityByCountry, selectSortedCountries, getLocalizedName} from "@/store/slices/dictionarySlice";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {formatNumberWithSpaces} from "@/utils/formatNumberWithSpaces";
import {useTranslation} from "react-i18next";
import i18n from "@/constants/i18n";
import CountryPickerModal from "@/components/CountryPickerModal";

const STATUS_ORDER = ['Новичок', 'Любитель', 'Мастер', 'Профи', 'Меценат'];

const Form = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { searchFields } = useAppSelector(state => state.home);
    const {
        countries,
        maritalStatus,
        statuses,
    } = useAppSelector(state => state.dictionary);

    const dispatch = useAppDispatch();
    const lang = i18n.language;

    const sortedStatuses = [...(statuses || [])].sort(
        (a, b) => STATUS_ORDER.indexOf(a.name) - STATUS_ORDER.indexOf(b.name)
    );

    const sortedCountries = useAppSelector(state => selectSortedCountries(state, lang));

    const statusTranslations: any = {
        'Новичок': t('about.table.beginner'),
        'Любитель': t('about.table.amateur'),
        'Мастер': t('about.table.master'),
        'Профи': t('about.table.pro'),
        'Меценат': t('about.table.patron'),
    };

    const renderStatusItem = ({ item }: any) => (
        <SelectItem
            label={statusTranslations[item.name] || item.name}
            value={item.code}
            key={item.code}
        />
    );

    const handleChange = (name: any, value: any) => {
        dispatch(updateSearchFields({ name, value }));
    };

    const onChangeSelect = (name: string, value: any) => {
        let foundedOptions;

        if (name === "country") {
            foundedOptions = countries?.find((item: any) => String(item.id) === String(value));
            dispatch(getCityByCountry(foundedOptions?.id));
        } else if (name === "status") {
            foundedOptions = statuses.find((item: any) => item.code === value);
        } else if (name === "maritalStatuses") {
            foundedOptions = maritalStatus.find((item: any) => item.code === value);
        }

        handleChange(name, foundedOptions);
    };

    const openCitiesPicker = () => {
        navigation.dispatch(StackActions.push("citiesOrRegions", { showCheckbox: false, fromWhere: "SEARCH" }));
    };

    const openProfessionsPicker = () => {
        navigation.dispatch(StackActions.push("professions", { fromWhere: "SEARCH" }));
    };

    const openFieldOfWorkPicker = () => {
        navigation.dispatch(StackActions.push("fieldOfWork", { fromWhere: "SEARCH" }));
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContainer}
                enableOnAndroid={true}
                extraScrollHeight={20}
                keyboardShouldPersistTaps="always"
            >
                <View style={styles.form}>
                    <VStack space="xl">

                        {/* ID */}
                        <FormControl>
                            <VStack space="xs">
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        № ID
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        inputMode="numeric"
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.id}
                                        onChangeText={(text) => handleChange("id", text)}
                                    />
                                </Input>
                            </VStack>
                        </FormControl>

                        {/* ФИО */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.fullName")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.fullName}
                                        onChangeText={(text) => handleChange("fullName", text)}
                                    />
                                </Input>
                            </FormControl>
                        </VStack>

                        {/* Логин */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.login")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.login}
                                        onChangeText={(text) => handleChange("login", text)}
                                    />
                                </Input>
                            </FormControl>
                        </VStack>

                        {/* Статус */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("home.status")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                    selectedValue={searchFields.status?.name}
                                    onValueChange={value => onChangeSelect("status", value)}
                                    key={searchFields.status?.code}
                                >
                                    <SelectTrigger variant="rounded" size="md">
                                        <SelectInput placeholder={t("signup.selectFromList")}/>
                                        <SelectIcon as={ChevronDownIcon} mr="$3"/>
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop/>
                                        <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator/>
                                            </SelectDragIndicatorWrapper>
                                            <FlatList
                                                data={sortedStatuses}
                                                renderItem={renderStatusItem}
                                                keyExtractor={item => item.id}
                                                style={{ width: '100%' }}
                                            />
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </FormControl>
                        </VStack>

                        {/* ─── Страна — заменено на CountryPickerModal ─── */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.country")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <CountryPickerModal
                                    countries={sortedCountries}
                                    selectedCountry={searchFields.country}
                                    lang={lang}
                                    onSelect={(id: string) => onChangeSelect("country", id)}
                                />
                            </FormControl>
                        </VStack>

                        {/* Город */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.city")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                    selectedValue={searchFields.city?.name}
                                    onValueChange={value => onChangeSelect("city", value)}
                                    key={searchFields.city?.code}
                                    onOpen={openCitiesPicker}
                                >
                                    <SelectTrigger variant="rounded" size="md">
                                        <SelectInput placeholder={t("signup.selectFromList")}/>
                                        <SelectIcon as={ChevronDownIcon} mr="$3"/>
                                    </SelectTrigger>
                                </Select>
                            </FormControl>
                        </VStack>

                        {/* Возраст */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("search.age")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <View style={styles.inputGroup}>
                                    <View style={{ flex: 1 }}>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField
                                                inputMode="numeric"
                                                placeholder={t("signup.from")}
                                                value={searchFields.ageFrom}
                                                onChangeText={(text) => handleChange("ageFrom", text)}
                                            />
                                        </Input>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField
                                                inputMode="numeric"
                                                placeholder={t("signup.to")}
                                                value={searchFields.ageTo}
                                                onChangeText={(text) => handleChange("ageTo", text)}
                                            />
                                        </Input>
                                    </View>
                                </View>
                            </FormControl>
                        </VStack>

                        {/* Образование */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.education")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.educationAndCourses}
                                        onChangeText={(text) => handleChange("educationAndCourses", text)}
                                    />
                                </Input>
                            </FormControl>
                        </VStack>

                        {/* Опыт */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.experience")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.experienceAndSkills}
                                        onChangeText={(text) => handleChange("experienceAndSkills", text)}
                                    />
                                </Input>
                            </FormControl>
                        </VStack>

                        {/* Сфера деятельности */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.fieldOfWork")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                    selectedValue={searchFields.fieldOfWork?.name}
                                    onOpen={openFieldOfWorkPicker}
                                    key={searchFields.fieldOfWork?.code}
                                >
                                    <SelectTrigger variant="rounded" size="md">
                                        <SelectInput placeholder={t("signup.selectFromList")}/>
                                        <SelectIcon as={ChevronDownIcon} mr="$3"/>
                                    </SelectTrigger>
                                </Select>
                            </FormControl>
                        </VStack>

                        {/* Профессия */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.profession")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Select
                                    selectedValue={
                                        searchFields.professions?.length
                                            ? searchFields.professions?.map((p: any) => p.name).join(", ")
                                            : null
                                    }
                                    key={searchFields.profession?.code}
                                    onOpen={openProfessionsPicker}
                                >
                                    <SelectTrigger variant="rounded" size="md">
                                        <SelectInput placeholder={t("signup.selectFromList")}/>
                                        <SelectIcon as={ChevronDownIcon} mr="$3"/>
                                    </SelectTrigger>
                                </Select>
                            </FormControl>
                        </VStack>

                        {/* Желаемый доход */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.desiredIncome")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <View style={styles.inputGroup}>
                                    <View style={{ flex: 1 }}>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField
                                                inputMode="numeric"
                                                placeholder={t("signup.from")}
                                                value={searchFields.minDesiredIncome}
                                                onChangeText={(text) => handleChange("minDesiredIncome", formatNumberWithSpaces(text))}
                                            />
                                        </Input>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                            <InputField
                                                inputMode="numeric"
                                                placeholder={t("signup.to")}
                                                value={searchFields.maxDesiredIncome}
                                                onChangeText={(text) => handleChange("maxDesiredIncome", formatNumberWithSpaces(text))}
                                            />
                                        </Input>
                                    </View>
                                </View>
                            </FormControl>
                        </VStack>

                        {/* Хобби */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.hobby")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.hobby}
                                        onChangeText={(text) => handleChange("hobby", text)}
                                    />
                                </Input>
                            </FormControl>
                        </VStack>

                        {/* Работа мечты */}
                        <VStack space="xs">
                            <FormControl>
                                <FormControlLabel>
                                    <FormControlLabelText style={textStyles.body12Light} color={Colors.grayDark}>
                                        {t("signup.dreamJob")}
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark}>
                                    <InputField
                                        placeholder={t("signup.placeholder")}
                                        value={searchFields.dreamWork}
                                        onChangeText={(text) => handleChange("dreamWork", text)}
                                    />
                                </Input>
                            </FormControl>
                        </VStack>

                    </VStack>
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    form: {
        flexGrow: 1,
        paddingTop: 16,
        paddingBottom: 16,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "row",
    },
});

export default Form;