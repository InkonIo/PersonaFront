import Colors from '@/constants/Colors';
import {useNavigation, useRouter} from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {textStyles} from "@/constants/textStyles";
import {
    Button, ButtonText,
    SelectItem,
} from "@gluestack-ui/themed";
import * as React from "react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {useCallback, useEffect, useState} from "react";
import {buttonStyles} from "@/constants/buttonStyles";
import Form from "@/components/Form";
import FilterTag from "@/components/FilterTag";
import {updateSearchFields} from "@/store/slices/homeSlice";
import {CommonActions, useFocusEffect} from "@react-navigation/native";
import {LoadingOverlay} from "@/components/LoadingOverlay";
import { getAllDictionaryData, getLocalizedName } from "@/store/slices/dictionarySlice";
import { useTranslation } from 'react-i18next';


const renderItem = ({item}: any) => (
    <SelectItem
        label={item.label}
        value={item.value}
        key={item.id}
    />
)

const selectFields = [
    "city",
    "country",
    "fieldOfWork",
    "professions",
    "status",
    "maritalStatuses"
];

const textFields = [
    "fullName",
    "hobby",
    "dreamWork",
    "educationAndCourses",
    "experienceAndSkills",
];

const getFilterTags = (searchFields: any, translations: any) => {
    const filterTags: { key: string; label: string }[] = [];

    Object.keys(searchFields).forEach((key) => {
        const value = searchFields[key];
        const translatedKey = translations[key] || key;

        if (selectFields.includes(key)) {
            if (Array.isArray(value)) {
                const names = value.map((item) => getLocalizedName(item)).filter(Boolean).join(", ");
                if (names) filterTags.push({ key, label: `${translatedKey}: ${names}` });
            } else if (typeof value === "object" && value !== null) {
                const name = getLocalizedName(value);
                if (name) filterTags.push({ key, label: `${translatedKey}: ${name}` });
            }
        }

        if (textFields.includes(key) && typeof value === "string" && value.trim()) {
            filterTags.push({ key, label: `${translatedKey}: ${value}` });
        }
    });

    return filterTags;
};


const Page = () => {
    const {searchFields} = useAppSelector(state => state.home)
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const keyTranslationsLocal: any = {
        city: t('signup.city'),
        country: t('signup.country'),
        fieldOfWork: t('signup.fieldOfWork'),
        professions: t('signup.profession'),
        status: t('home.status'),
        maritalStatuses: t('signup.maritalStatus'),
        fullName: t('signup.fullName'),
        hobby: t('signup.hobby'),
        dreamWork: t('signup.dreamJob'),
        educationAndCourses: t('signup.education'),
        experienceAndSkills: t('signup.experience'),
    };

    const dispatch = useAppDispatch()
    const navigation = useNavigation();

    useEffect(() => {
        dispatch(getAllDictionaryData())
    }, [])

    const searchAnkets = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "(tabs)" }],
            })
        );
    }

    const [filters, setFilters] = useState<any[]>([]);

    useEffect(() => {
        setFilters(getFilterTags(searchFields, keyTranslationsLocal));
    }, [searchFields, t]);

    const handleRemoveFilter = (filter: string) => {
        const key = filter.split(':')[0].trim();
        const translatedKey = Object.keys(keyTranslationsLocal)
            .find(k => keyTranslationsLocal[k] === key) || key;
        dispatch(updateSearchFields({name: translatedKey, value: ''}));
    };

    useFocusEffect(
        useCallback(() => {
            if (filters.length === 0) {
                navigation.setOptions({ gestureEnabled: true });
            } else {
                navigation.setOptions({ gestureEnabled: false });
            }
        }, [navigation, filters])
    );

    const bottomButtonHeight = 56 + 16 + 16 + Math.max(insets.bottom, 16);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: bottomButtonHeight + 16 }}
            >
                <View style={styles.searchFields}>
                    <View style={styles.filtersContainer}>
                        {filters.map((filter, index) => (
                           <FilterTag
                               key={index}
                               filter={filter.label}                          // ← добавь .label
                               onRemove={() => handleRemoveFilter(filter.key)} // ← стрелочная функция с .key
                           />
                        ))}
                    </View>
                    <Text style={[textStyles.body16Medium, {color: Colors.text}]}>
                        {t('search.fillFields')}
                    </Text>

                    <Form />
                </View>
            </ScrollView>

            <View style={[
                styles.bottomButtonContainer,
                { paddingBottom: Math.max(insets.bottom, 16) }
            ]}>
                <Button style={[buttonStyles.activeFilledButton]} onPress={searchAnkets}>
                    <ButtonText style={[textStyles.body16Light, {color: Colors.white}]}>
                        {t('search.searchProfiles')}
                    </ButtonText>
                </Button>
            </View>

            <LoadingOverlay loading={loading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    form: {
        marginTop: 16,
        marginBottom: 16,
    },
    searchFields: {
        marginVertical: 16,
        marginHorizontal: 16,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "row"
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowIcon: {
        marginRight: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginLeft: 12,
    },
    voiceIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'gray',
    },
    filtersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

export default Page;