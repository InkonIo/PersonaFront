import React, { useState } from 'react';
import {
    Modal,
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
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
import { XIcon, ArrowLeftIcon, SearchIcon } from 'lucide-react-native';

interface CountryPickerModalProps {
    countries: any[];
    selectedCountry: any;
    lang: string;
    onSelect: (id: string) => void;
    onClear?: () => void;
    placeholder?: string;
}

const CountryPickerModal = ({
    countries,
    selectedCountry,
    lang,
    onSelect,
    onClear,
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
    };

    return (
        <>
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
                        {selectedCountry && onClear ? (
                            <TouchableOpacity onPress={onClear}>
                                <InputIcon as={XIcon} />
                            </TouchableOpacity>
                        ) : (
                            <InputIcon as={ChevronDownIcon} />
                        )}
                    </InputSlot>
                </Input>
            </TouchableOpacity>

            <Modal
                visible={visible}
                animationType="slide"
                transparent={false}
                onRequestClose={handleClose}
            >
                <SafeAreaView style={styles.container}>
                    <StatusBar barStyle="dark-content" />

                    {/* Хедер */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
                            <ArrowLeftIcon size={22} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('signup.country')}</Text>
                        <View style={{ width: 32 }} />
                    </View>

                    {/* Поиск */}
                    <View style={styles.searchContainer}>
                        <SearchIcon size={16} color={Colors.grayDark} />
                        <TextInput
                            placeholder={t('signup.placeholder')}
                            value={query}
                            onChangeText={setQuery}
                            style={styles.searchInput}
                            placeholderTextColor={Colors.grayDark}
                            autoFocus={true}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <XIcon size={16} color={Colors.grayDark} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Список */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => String(item.id)}
                        keyboardShouldPersistTaps="always"
                        renderItem={({ item }) => {
                            const isSelected = selectedCountry?.id === item.id;
                            return (
                                <TouchableOpacity
                                    onPress={() => handleSelect(String(item.id))}
                                    activeOpacity={0.6}
                                    style={[styles.item, isSelected && styles.itemSelected]}
                                >
                                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                                        {getLocalizedName(item, lang)}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkDot} />
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {t('signup.noResults') ?? 'Ничего не найдено'}
                                </Text>
                            </View>
                        }
                    />
                </SafeAreaView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        borderWidth: 1,
        borderColor: Colors.grayDark,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 10 : 6,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    itemSelected: {
        backgroundColor: '#f0faf4',
    },
    itemText: {
        fontSize: 15,
        color: '#000',
    },
    itemTextSelected: {
        color: Colors.greenSecond,
        fontWeight: '500',
    },
    checkDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.greenSecond,
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