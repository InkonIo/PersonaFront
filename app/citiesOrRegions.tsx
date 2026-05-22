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
        fromWhere?: "REGISTRATION" | "SEARCH";
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
    const { searchFields } = useAppSelector(state => state.home); // ← добавлено
    const { t } = useTranslation();
    const { showCheckbox = false, fromWhere = "SEARCH" } = route.params || {};
    const [searchQuery, setSearchQuery] = useState<string>("");

    const lang = i18n.language;
    const sortedRegions = useAppSelector((state) => selectSortedRegions(state, lang));
    const sortedCities = useAppSelector((state) => selectSortedCities(state, lang));

    const ALL_REGIONS_ID = -1;

    // ─── ФИКС: при входе на экран с чекбоксами синхронизируем selectedCity ──
    // с нужным источником (профиль или поисковые фильтры), не даём утечь данным
    useEffect(() => {
        if (!showCheckbox) return; // на экране регионов чекбоксов нет — пропускаем

        const sourceCity = fromWhere === "REGISTRATION"
            ? formData?.city
            : searchFields?.city;

        if (sourceCity?.id) {
            dispatch(setSelectedCity(sourceCity.id));
        } else {
            dispatch(setSelectedCity(null)); // ← сбрасываем если источник пуст
        }
    }, [showCheckbox, fromWhere]);
    // ────────────────────────────────────────────────────────────────────────

    const filteredItems: RegionOrCity[] = showCheckbox
    ? sortedCities.filter((city: RegionOrCity) =>
        getLocalizedName(city).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [
        { id: ALL_REGIONS_ID, name: t('common.allRegions'), code: 'ALL' },
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
    } else {
        dispatch(updateSearchFields({ name: "city", value: allRegionsObj }));
        navigation.navigate("search");
    }
    return;
}
        await goToRegionWithCheckbox(id);
        return;
    }
    dispatch(setSelectedCity(id));
};

    const goToRegionWithCheckbox = async (regionId: number) => {
        await dispatch(getRegion(regionId));
        navigation.dispatch(StackActions.push("citiesOrRegions", { showCheckbox: true, fromWhere }));
    };

    const renderCity = ({ item }: { item: RegionOrCity }) => (
    <TouchableOpacity onPress={() => toggleCitySelection(item.id)} style={styles.cityContainer}>
        <Text style={[textStyles.body16Light]}>{getLocalizedName(item)}</Text>
        {showCheckbox ? (
            <Checkbox value={selectedCity === item.id} onValueChange={() => toggleCitySelection(item.id)} />
        ) : (
            item.id !== ALL_REGIONS_ID && <InputIcon as={ChevronRightIcon} />
        )}
    </TouchableOpacity>
);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                showCheckbox && selectedCity !== null ? (
                    <TouchableOpacity onPress={() => dispatch(setSelectedCity(null))} style={styles.resetButton}>
                        <Text style={[textStyles.body16Light, { color: Colors.black }]}>{t('common.reset')}</Text>
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, selectedCity, showCheckbox, t]);

    const onSelectCity = () => {
        const currentSelectedCity = sortedCities.find((city: RegionOrCity) => city.id === selectedCity);
        if (fromWhere === "REGISTRATION") {
            dispatch(updateFormData({ name: "city", value: currentSelectedCity }));
            navigation.navigate("signup");
        } else {
            dispatch(updateSearchFields({ name: "city", value: currentSelectedCity }));
            navigation.navigate("search");
        }
    };

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
                contentContainerStyle={selectedCity !== null ? styles.listContentContainer : [{ paddingBottom: 40 }]}
            />

            {selectedCity !== null && (
                <View style={styles.bottomButtonContainer}>
                    <Button style={[buttonStyles.activeFilledButton]} onPress={onSelectCity}>
                        <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>{t('common.apply')}</ButtonText>
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