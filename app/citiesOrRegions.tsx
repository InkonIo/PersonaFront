import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Checkbox from "expo-checkbox";
import { Button, ButtonText, Input, InputField, InputIcon, InputSlot, SearchIcon } from "@gluestack-ui/themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigation, StackActions, RouteProp, useRoute } from "@react-navigation/native";
import { ChevronRightIcon } from "lucide-react-native";
import {
    getRegion,
    setSelectedCity,
    getLocalizedName,
    selectSortedRegions,
    selectSortedCities,
    getCityByCountry,
} from "@/store/slices/dictionarySlice";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { updateFormData } from "@/store/slices/usersSlice";
import { updateSearchFields } from "@/store/slices/homeSlice";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { buttonStyles } from "@/constants/buttonStyles";
import { useTranslation } from "react-i18next";
import i18n from "@/constants/i18n";

type RootStackParamList = {
    signup: undefined;
    search: undefined;
    citiesOrRegions: {
        showCheckbox?: boolean;
        fromWhere?: "REGISTRATION" | "SEARCH" | "EDIT";
        regionId?: number | null;
        countryId?: number | null;
    };
};

type RegionOrCity = {
    id: number;
    name: string;
    code: string;
    isCheckbox?: boolean;
};

const CityList = () => {
    const route = useRoute<RouteProp<RootStackParamList, "citiesOrRegions">>();
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { loading, selectedCity } = useAppSelector((state) => state.dictionary);
    const { formData } = useAppSelector(state => state.user);
    const { searchFields } = useAppSelector(state => state.home);
    const { t } = useTranslation();
    const { showCheckbox = false, fromWhere = "SEARCH", regionId = null, countryId = null } = route.params || {};
    const [searchQuery, setSearchQuery] = useState<string>("");

    const lang = i18n.language;
    const sortedRegions = useAppSelector((state) => selectSortedRegions(state, lang));
    const sortedCities = useAppSelector((state) => selectSortedCities(state, lang));

    // Множественный выбор — только для SEARCH
    const [selectedCities, setSelectedCities] = useState<Set<number>>(new Set());

    const ALL_REGIONS_ID = -1;
    const ALL_CITIES_ID = -2;

    const [currentRegionId, setCurrentRegionId] = useState<number | null>(null);

    // Инициализация — разделена на SEARCH и остальные
    useEffect(() => {
        if (!showCheckbox) return;
        if (fromWhere === "SEARCH") {
            const sourceCity = searchFields?.city;
            if (sourceCity?.id && sourceCity.id !== ALL_CITIES_ID) {
                setSelectedCities(new Set([sourceCity.id]));
            } else {
                setSelectedCities(new Set());
            }
        } else {
            // REGISTRATION и EDIT — старая логика через Redux
            const sourceCity = fromWhere === "REGISTRATION" ? formData?.city : searchFields?.city;
            if (sourceCity?.id) {
                dispatch(setSelectedCity(sourceCity.id));
            } else {
                dispatch(setSelectedCity(null));
            }
        }
    }, [showCheckbox, fromWhere]);

    const filteredItems: RegionOrCity[] = showCheckbox
        ? [
            ...(fromWhere === "SEARCH" ? [{ id: ALL_CITIES_ID, name: t('common.allCities'), code: 'ALL_CITIES' }] : []),
            ...sortedCities.filter((city: RegionOrCity) =>
                getLocalizedName(city).toLowerCase().includes(searchQuery.toLowerCase())
            )
          ]
        : [
            ...(fromWhere !== "EDIT" ? [{ id: ALL_REGIONS_ID, name: t('common.allRegions'), code: 'ALL' }] : []),
            ...sortedRegions.filter((region: RegionOrCity) =>
                getLocalizedName(region).toLowerCase().includes(searchQuery.toLowerCase())
            )
          ];

    const toggleCitySelection = async (id: number) => {
        if (!showCheckbox) {
            if (id === ALL_REGIONS_ID) {
                const allRegionsObj = { id: ALL_REGIONS_ID, name: 'Все регионы', nameRu: 'Все регионы', nameKz: 'Барлық аймақтар', nameEn: 'All regions', code: 'ALL' };
                if (fromWhere === "REGISTRATION") {
                    dispatch(updateFormData({ name: "city", value: allRegionsObj }));
                    navigation.navigate("signup");
                } else if (fromWhere === "EDIT") {
                    dispatch(updateFormData({ name: "city", value: allRegionsObj }));
                    navigation.goBack();
                } else {
                    dispatch(updateSearchFields({ name: "city", value: allRegionsObj }));
                    navigation.navigate("search");
                }
                return;
            }
            await goToRegionWithCheckbox(id);
            return;
        }

        if (id === ALL_CITIES_ID) {
            const allCitiesObj = {
                id: ALL_CITIES_ID,
                name: 'Все города',
                nameRu: 'Все города',
                nameKz: 'Барлық қалалар',
                nameEn: 'All cities',
                code: 'ALL_CITIES',
                regionId: regionId
            };
            if (fromWhere === "REGISTRATION") {
                dispatch(updateFormData({ name: "city", value: allCitiesObj }));
                navigation.navigate("signup");
            } else if (fromWhere === "EDIT") {
                dispatch(updateFormData({ name: "city", value: allCitiesObj }));
                navigation.goBack();
            } else {
                dispatch(updateSearchFields({ name: "city", value: allCitiesObj }));
                navigation.navigate("search");
            }
            return;
        }

        if (fromWhere === "SEARCH") {
            // Множественный выбор — только для поиска
            setSelectedCities(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        } else {
            // REGISTRATION и EDIT — старая логика через Redux
            dispatch(setSelectedCity(id));
        }
    };

    const goToRegionWithCheckbox = async (regionId: number) => {
        setCurrentRegionId(regionId);
        await dispatch(getRegion(regionId));
        navigation.dispatch(StackActions.push("citiesOrRegions", { showCheckbox: true, fromWhere, regionId }));
    };

    const renderCity = ({ item }: { item: RegionOrCity }) => (
        <TouchableOpacity onPress={() => toggleCitySelection(item.id)} style={styles.cityContainer}>
            <Text style={[textStyles.body16Light]}>{getLocalizedName(item)}</Text>
            {showCheckbox ? (
                item.id !== ALL_CITIES_ID && (
                    <Checkbox
                        value={fromWhere === "SEARCH" ? selectedCities.has(item.id) : selectedCity === item.id}
                        onValueChange={() => toggleCitySelection(item.id)}
                    />
                )
            ) : (
                item.id !== ALL_REGIONS_ID && <InputIcon as={ChevronRightIcon} />
            )}
        </TouchableOpacity>
    );

    // Хедер "Сбросить" — учитывает оба стейта
    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                showCheckbox && (fromWhere === "SEARCH" ? selectedCities.size > 0 : selectedCity !== null) ? (
                    <TouchableOpacity
                        onPress={() => {
                            if (fromWhere === "SEARCH") setSelectedCities(new Set());
                            else dispatch(setSelectedCity(null));
                        }}
                        style={styles.resetButton}
                    >
                        <Text style={[textStyles.body16Light, { color: Colors.black }]}>
                            {t('common.reset')}
                        </Text>
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, selectedCity, selectedCities, showCheckbox, fromWhere, t]);

    const onSelectCity = () => {
        if (fromWhere === "SEARCH") {
            const chosenCities = sortedCities.filter((city: RegionOrCity) =>
                selectedCities.has(city.id)
            );
            const value = chosenCities.length === 1 ? chosenCities[0] : chosenCities;
            dispatch(updateSearchFields({ name: "city", value }));
            navigation.navigate("search");
        } else {
            // REGISTRATION и EDIT — без изменений
            const currentSelectedCity = sortedCities.find((city: RegionOrCity) => city.id === selectedCity);
            if (fromWhere === "REGISTRATION") {
                dispatch(updateFormData({ name: "city", value: currentSelectedCity }));
                navigation.navigate("signup");
            } else {
                dispatch(updateFormData({ name: "city", value: currentSelectedCity }));
                navigation.goBack();
            }
        }
    };

    useEffect(() => {
    if (!showCheckbox && countryId && sortedRegions.length === 0) {
        dispatch(getCityByCountry(countryId));
    }
}, []);

// Добавь временно прямо перед return:
console.log('sortedRegions:', sortedRegions);
console.log('route.params:', route.params);
console.log('lang:', lang);
console.log('filteredItems:', filteredItems);

    return (
        <View style={styles.container}>
            <LoadingOverlay loading={loading} />

            <Input variant="rounded" size="md" borderWidth={1} borderColor={Colors.grayDark} margin={16}>
                <InputSlot style={{ marginLeft: 12 }}>
                    <InputIcon as={SearchIcon} />
                </InputSlot>
                <InputField
                    placeholder={t('signup.placeholder')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </Input>

            <FlatList
                data={filteredItems}
                renderItem={renderCity}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={
                    (fromWhere === "SEARCH" ? selectedCities.size > 0 : selectedCity !== null)
                        ? styles.listContentContainer
                        : [{ paddingBottom: 40 }]
                }
            />

            {(fromWhere === "SEARCH" ? selectedCities.size > 0 : selectedCity !== null) && (
                <View style={styles.bottomButtonContainer}>
                    <Button style={[buttonStyles.activeFilledButton]} onPress={onSelectCity}>
                        <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>
                            {t('common.apply')}
                        </ButtonText>
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    cityContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    resetButton: {
        marginRight: 0,
        paddingHorizontal: 8,
    },
    bottomButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: 16,
        paddingBottom: 32,
        marginRight: 0,
    },
    listContentContainer: {
        paddingBottom: 100,
    },
});

export default CityList;