import React, { useState } from 'react';
import {
    Modal,
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Dimensions,
} from 'react-native';
import {
    ChevronDownIcon,
    Input,
    InputField,
    InputSlot,
    InputIcon,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/store/slices/dictionarySlice';
import Colors from '@/constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

interface CountryPickerModalProps {
    countries: any[];
    selectedCountry: any;
    lang: string;
    onSelect: (id: string) => void;
    placeholder?: string;
}

const CountryPickerModal = ({
    countries,
    selectedCountry,
    lang,
    onSelect,
    placeholder,
}: CountryPickerModalProps) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState('');

    const filtered = query.trim()
        ? countries.filter((c: any) =>
              getLocalizedName(c, lang).toLowerCase().includes(query.toLowerCase())
          )
        : countries;

    const handleSelect = (id: string) => {
        onSelect(id);
        setVisible(false);
        setQuery('');
    };

    const handleClose = () => {
        setVisible(false);
        setQuery('');
        Keyboard.dismiss();
    };

    return (
        <>
            {/* Триггер */}
            <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.7}>
                <Input
                    variant="rounded"
                    size="md"
                    borderWidth={1}
                    borderColor={Colors.grayDark}
                    pointerEvents="none"
                >
                    <InputField
                        placeholder={placeholder ?? t('signup.selectFromList')}
                        value={selectedCountry ? getLocalizedName(selectedCountry, lang) : ''}
                        editable={false}
                    />
                    <InputSlot pr="$3">
                        <InputIcon as={ChevronDownIcon} />
                    </InputSlot>
                </Input>
            </TouchableOpacity>

            {/* Модалка */}
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleClose}
            >
                {/*
                    Внешний TouchableWithoutFeedback закрывает модалку
                    при тапе по тёмному backdrop-у.
                */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlay}>
                        {/*
                            Внутренний TouchableWithoutFeedback останавливает
                            всплытие события — тап по шторке не уходит на handleClose.
                            Keyboard.dismiss НЕ вызываем здесь, чтобы клавиатура
                            оставалась открытой пока пользователь тыкает по списку.
                        */}
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={[styles.sheet, { height: SHEET_HEIGHT }]}
                            >
                                {/* Ручка */}
                                <View style={styles.handle} />

                                {/* Поле поиска */}
                                <View style={styles.searchContainer}>
                                    <TextInput
                                        placeholder={t('signup.placeholder')}
                                        value={query}
                                        onChangeText={setQuery}
                                        style={styles.searchInput}
                                        placeholderTextColor={Colors.grayDark}
                                        autoFocus={true}
                                        returnKeyType="search"
                                    />
                                </View>

                                {/* Список */}
                                <FlatList
                                    data={filtered}
                                    keyExtractor={(item) => String(item.id)}
                                    style={styles.list}
                                    contentContainerStyle={styles.listContent}
                                    /*
                                        "handled" — тап по TouchableOpacity
                                        обрабатывается сразу, без предварительного
                                        закрытия клавиатуры.
                                    */
                                    keyboardShouldPersistTaps="always"
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => handleSelect(String(item.id))}
                                            activeOpacity={0.6}
                                            style={styles.item}
                                        >
                                            <Text style={styles.itemText}>
                                                {getLocalizedName(item, lang)}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>
                                                {t('signup.noResults') ?? 'Ничего не найдено'}
                                            </Text>
                                        </View>
                                    }
                                />
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 10,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 10,
    },
    searchContainer: {
        marginHorizontal: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.grayDark,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    },
    searchInput: {
        fontSize: 14,
        color: '#000',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    item: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 14,
        color: '#000',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.grayDark,
        fontSize: 14,
    },
});

export default CountryPickerModal;

