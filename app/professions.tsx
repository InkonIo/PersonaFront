import React, {useEffect, useState} from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import {Button, ButtonText, Input, InputField, InputIcon, InputSlot, SearchIcon} from "@gluestack-ui/themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import Colors from "@/constants/Colors";
import {buttonStyles} from "@/constants/buttonStyles";
import {textStyles} from "@/constants/textStyles";
import {updateFormData} from "@/store/slices/usersSlice";
import {useNavigation} from "expo-router";
import {updateSearchFields} from "@/store/slices/homeSlice";
import {RouteProp, useRoute} from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "@/store/slices/dictionarySlice";

type RootStackParamList = {
    professions: {
        fromWhere?: "REGISTRATION" | "SEARCH";
    };
};

const ProfessionList = () => {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { professions, loading } = useAppSelector(state => state.dictionary);
    const { formData } = useAppSelector(state => state.user);
    const { searchFields } = useAppSelector(state => state.home); // ← добавлено
    const route = useRoute<RouteProp<RootStackParamList, "professions">>();

    const { fromWhere = "SEARCH" } = route.params || {};

    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedProfessions, setSelectedProfessions] = useState<number[]>([]);

    const toggleProfessionSelection = (professionId: number) => {
        setSelectedProfessions(prev =>
            prev.includes(professionId)
                ? prev.filter(id => id !== professionId)
                : [...prev, professionId]
        );
    };

    const filteredProfessions = professions.filter((profession: any) =>
        getLocalizedName(profession).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── ФИКС: берём источник в зависимости от режима ──────────────────────────
    const sourceProfessions = fromWhere === "REGISTRATION"
        ? formData?.professions
        : searchFields?.professions;

    useEffect(() => {
        if (sourceProfessions?.length) {
            const selectedIds = sourceProfessions.map((profess: any) => profess.id);
            const selected = professions.filter((profession: any) =>
                selectedIds.includes(profession.id)
            );
            setSelectedProfessions(selected.map((prof: any) => prof.id));
        } else {
            setSelectedProfessions([]); // ← сбрасываем если в источнике пусто
        }
    }, [sourceProfessions, professions]);
    // ───────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                selectedProfessions.length !== 0 ? (
                    <TouchableOpacity onPress={() => setSelectedProfessions([])} style={{ marginRight: 16 }}>
                        <Text style={[textStyles.body16Light, {color: Colors.black}]}>{t('common.reset')}</Text>
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, selectedProfessions, t]);

    const renderProfession = ({ item }: { item: { id: number; name: string } }) => (
        <TouchableOpacity
            onPress={() => toggleProfessionSelection(item.id)}
            style={styles.professionContainer}
        >
            <Text style={styles.professionName}>{getLocalizedName(item)}</Text>
            <Checkbox
                value={selectedProfessions.includes(item.id)}
                onValueChange={() => toggleProfessionSelection(item.id)}
            />
        </TouchableOpacity>
    );

    const onSelectProfessions = () => {
        const currentSelectedProfessions = professions.filter((profession: any) =>
            selectedProfessions.includes(profession.id)
        );

        if (fromWhere === "REGISTRATION") {
            dispatch(updateFormData({name: "professions", value: currentSelectedProfessions}));
            navigation.navigate("signup");
        } else {
            dispatch(updateSearchFields({name: "professions", value: currentSelectedProfessions}));
            navigation.navigate("search");
        }
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay loading={loading} />
            <Input
                variant="rounded"
                size="md"
                borderWidth={1}
                borderColor={Colors.grayDark}
                margin={16}
            >
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
                data={filteredProfessions}
                renderItem={renderProfession}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={selectedProfessions.length !== 0 ? { paddingBottom: 90 } : undefined}
            />
            {selectedProfessions.length !== 0 && (
                <View style={styles.bottomButtonContainer}>
                    <Button style={[buttonStyles.activeFilledButton]} onPress={onSelectProfessions}>
                        <ButtonText style={[textStyles.body16Light, {color: Colors.white}]}>
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
    },
    professionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    professionName: {
        fontSize: 16,
        color: Colors.black,
        flex: 1,
        marginRight: 12,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        paddingBottom: 32,
    },
});

export default ProfessionList;