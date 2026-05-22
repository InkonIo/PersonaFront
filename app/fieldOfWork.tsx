import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Button, ButtonText, Input, InputField, InputIcon, InputSlot, SearchIcon } from "@gluestack-ui/themed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import Colors from "@/constants/Colors";
import { buttonStyles } from "@/constants/buttonStyles";
import { textStyles } from "@/constants/textStyles";
import { updateFormData } from "@/store/slices/usersSlice";
import { useNavigation } from "expo-router";
import { updateSearchFields } from "@/store/slices/homeSlice";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "@/store/slices/dictionarySlice";

const FieldOfWorkList = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    const { workFields, loading } = useAppSelector(state => state.dictionary);
    const { formData } = useAppSelector(state => state.user);
    const { searchFields } = useAppSelector(state => state.home); // ← добавлено
    const { fromWhere } = route.params as { fromWhere: "REGISTRATION" | "SEARCH" };

    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedFieldOfWork, setSelectedFieldOfWork] = useState<number | null>(null);

    // ─── ФИКС: берём источник в зависимости от режима ──────────────────────
    const sourceFieldOfWork = fromWhere === "REGISTRATION"
        ? formData?.fieldOfWork
        : searchFields?.fieldOfWork;

    useEffect(() => {
        if (sourceFieldOfWork?.id) {
            setSelectedFieldOfWork(sourceFieldOfWork.id);
        } else {
            setSelectedFieldOfWork(null); // ← сбрасываем если источник пуст
        }
    }, [sourceFieldOfWork]);
    // ────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                selectedFieldOfWork !== null ? (
                    <TouchableOpacity onPress={() => setSelectedFieldOfWork(null)} style={styles.resetButton}>
                        <Text style={[textStyles.body16Light, { color: Colors.black }]}>{t('common.reset')}</Text>
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, selectedFieldOfWork, t]);

    const filteredWorkFields = workFields.filter((field: any) =>
        getLocalizedName(field).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFieldSelection = (fieldId: number) => {
        setSelectedFieldOfWork(prev => (prev === fieldId ? null : fieldId));
    };

    const onSelectFieldOfWork = () => {
        (navigation as any).navigate(fromWhere === "REGISTRATION" ? "signup" : "search");
        const selectedField = workFields.find((field: any) => field.id === selectedFieldOfWork);
        if (fromWhere === "REGISTRATION") {
            dispatch(updateFormData({ name: "fieldOfWork", value: selectedField }));
        } else {
            dispatch(updateSearchFields({ name: "fieldOfWork", value: selectedField }));
        }
    };

    const renderField = ({ item }: { item: { id: number; name: string } }) => (
        <TouchableOpacity
            onPress={() => toggleFieldSelection(item.id)}
            style={styles.fieldContainer}
        >
            <Text style={styles.fieldName}>{getLocalizedName(item)}</Text>
            <Checkbox
                value={selectedFieldOfWork === item.id}
                onValueChange={() => toggleFieldSelection(item.id)}
            />
        </TouchableOpacity>
    );

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
                data={filteredWorkFields}
                renderItem={renderField}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={selectedFieldOfWork !== null ? { paddingBottom: 90 } : undefined}
            />
            {selectedFieldOfWork !== null && (
                <View style={styles.bottomButtonContainer}>
                    <Button style={[buttonStyles.activeFilledButton]} onPress={onSelectFieldOfWork}>
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
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    fieldName: {
        fontSize: 16,
        color: Colors.black,
        flex: 1,
        marginRight: 12
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
    resetButton: {
        marginRight: 16,
    },
});

export default FieldOfWorkList;