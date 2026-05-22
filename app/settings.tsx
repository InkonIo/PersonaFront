import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Pressable,
    ScrollView,
    Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CheckIcon, ChevronRightIcon, GlobeIcon, StarIcon, Trash2Icon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { changeLanguage } from '@/constants/i18n';
import i18n from '@/constants/i18n';
import { textStyles } from '@/constants/textStyles';
import Colors from '@/constants/Colors';
import { BiometricSettings } from '@/app/BiometricSettings';
import { deleteCurrentUser } from '@/store/slices/usersSlice';
import { logout } from '@/store/slices/authSlice';
import { instance } from '@/store/api';

const SettingsPage = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [selectedLang, setSelectedLang] = useState(i18n.language ?? 'ru');
    const [showLanguageSheet, setShowLanguageSheet] = useState(false);
    const [showLimitSheet, setShowLimitSheet] = useState(false);
    const [dailyLimit, setDailyLimit] = useState<number>(0);
    const [remaining, setRemaining] = useState<number>(0);

    useFocusEffect(
        useCallback(() => {
            Promise.all([
                instance.get('api/ratings/limit'),
                instance.get('api/ratings/remaining'),
            ]).then(([limitRes, remainingRes]) => {
                if (typeof limitRes.data === 'number') setDailyLimit(limitRes.data);
                if (typeof remainingRes.data === 'number') setRemaining(remainingRes.data);
            }).catch((err) => {
    console.log('🚨 [settings useFocusEffect] ERROR:', err?.response?.status, err?.message);
});
        }, [])
    );

    const handleLanguageChange = async (lang: string) => {
        setSelectedLang(lang);
        await changeLanguage(lang as 'ru' | 'en' | 'kz');
        setShowLanguageSheet(false);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('settings.deleteAccount', 'Удалить аккаунт'),
            t('settings.deleteAccountConfirm', 'Это действие необратимо. Все данные будут удалены.'),
            [
                { text: t('common.cancel', 'Отмена'), style: 'cancel' },
                {
                    text: t('settings.deleteAccount', 'Удалить'),
                    style: 'destructive',
                    onPress: async () => {
    try {
        await dispatch(deleteCurrentUser()).unwrap();
        dispatch(logout());
        // router.replace('/') ← убрать
    } catch (err: any) {
        Alert.alert(t('common.error', 'Ошибка'), err.message);
    }
},
                },
            ]
        );
    };

    const langLabel: Record<string, string> = {
        ru: t('language.ru'),
        en: t('language.en'),
        kz: t('language.kz'),
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <SafeAreaView>

                    {/* ─── Language ─── */}
                    <SectionTitle title={t('settings.language', 'Язык')} />
                    <View style={styles.group}>
                        <SettingsRow
                            icon={<GlobeIcon size={18} color={Colors.grayDark} />}
                            label={langLabel[selectedLang] ?? selectedLang}
                            onPress={() => setShowLanguageSheet(true)}
                        />
                    </View>

                    {/* ─── Security ─── */}
                    <SectionTitle title={t('settings.security', 'Безопасность')} />
                    <View style={styles.group}>
                        <BiometricSettings />
                    </View>

                    {/* ─── Ratings ─── */}
                    <SectionTitle title={t('settings.ratings', 'Оценки')} />
                    <View style={styles.group}>
                        <SettingsRow
                            icon={<StarIcon size={18} color={Colors.grayDark} />}
                            label={t('settings.dailyLimit', 'Дейли лимит оценок')}
                            value={`${remaining}/${dailyLimit}`}
                            onPress={() => setShowLimitSheet(true)}
                        />
                    </View>

                    {/* ─── Danger zone ─── */}
                    <SectionTitle title={t('settings.dangerZone', 'Опасная зона')} />
                    <View style={[styles.group, styles.dangerGroup]}>
                        <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount} activeOpacity={0.7}>
                            <View style={styles.dangerIcon}>
                                <Trash2Icon size={18} color="#FF3B30" />
                            </View>
                            <Text style={[textStyles.body16Light, { color: '#FF3B30', flex: 1 }]}>
                                {t('settings.deleteAccount', 'Удалить аккаунт')}
                            </Text>
                            <ChevronRightIcon size={18} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </SafeAreaView>
            </ScrollView>

            {/* ─── Language Sheet ─── */}
            <Modal visible={showLanguageSheet} transparent animationType="slide" onRequestClose={() => setShowLanguageSheet(false)}>
                <Pressable style={styles.overlay} onPress={() => setShowLanguageSheet(false)}>
                    <Pressable style={styles.sheet} onPress={() => {}}>
                        <View style={styles.handle} />
                        <Text style={[textStyles.body16Light, styles.sheetTitle]}>
                            {t('settings.selectLanguage', 'Выберите язык')}
                        </Text>
                        {(['ru', 'en', 'kz'] as const).map((code) => (
                            <TouchableOpacity key={code} style={styles.sheetItem} onPress={() => handleLanguageChange(code)}>
                                <Text style={[textStyles.body16Light, { color: Colors.text }]}>
                                    {t(`language.${code}`)}
                                </Text>
                                {selectedLang === code && <CheckIcon size={20} color={Colors.greenSecond ?? '#4CAF50'} />}
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ─── Daily Limit Sheet ─── */}
            <Modal visible={showLimitSheet} transparent animationType="slide" onRequestClose={() => setShowLimitSheet(false)}>
                <Pressable style={styles.overlay} onPress={() => setShowLimitSheet(false)}>
                    <Pressable style={styles.sheet} onPress={() => {}}>
                        <View style={styles.handle} />
                        <Text style={[textStyles.body16Light, styles.sheetTitle]}>
                            {t('settings.dailyLimitInfo', 'Ваш дневной лимит оценок')}
                        </Text>
                        <Text style={[textStyles.body16Light, { color: Colors.grayDark, marginBottom: 12, paddingHorizontal: 4 }]}>
                            {t('settings.dailyLimitDesc', 'Лимит устанавливается администратором.')}
                        </Text>
                        <View style={styles.limitDisplay}>
                            <View style={styles.limitBlock}>
                                <Text style={[textStyles.body20Medium, { color: Colors.text }]}>{remaining}</Text>
                                <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginTop: 2 }]}>
                                    {t('settings.remaining', 'осталось')}
                                </Text>
                            </View>
                            <Text style={{ color: Colors.grayDark, fontSize: 20, marginHorizontal: 12 }}>/</Text>
                            <View style={styles.limitBlock}>
                                <Text style={[textStyles.body20Medium, { color: Colors.text }]}>{dailyLimit}</Text>
                                <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginTop: 2 }]}>
                                    {t('settings.perDay', 'в сутки')}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

type SettingsRowProps = {
    icon?: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
};

const SettingsRow = ({ icon, label, value, onPress, rightElement }: SettingsRowProps) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        {icon && <View style={styles.rowIcon}>{icon}</View>}
        <Text style={[textStyles.body16Light, { color: Colors.text, flex: 1 }]}>{label}</Text>
        {value ? (
            <Text style={[textStyles.body16Light, { color: Colors.grayDark, marginRight: 8 }]}>{value}</Text>
        ) : null}
        {rightElement ?? (onPress ? <ChevronRightIcon size={18} color={Colors.grayDark} /> : null)}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    sectionTitle: {
        fontSize: 12,
        color: Colors.grayDark ?? '#888',
        fontFamily: 'futuraPTLight',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    group: {
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    dangerGroup: {
        backgroundColor: '#FFF5F5',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    rowIcon: {
        marginRight: 12,
        width: 22,
        alignItems: 'center',
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dangerIcon: {
        marginRight: 12,
        width: 22,
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    handle: {
        width: 40, height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    sheetItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    limitDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginHorizontal: 4,
        marginTop: 8,
    },
    limitBlock: {
        alignItems: 'center',
    },
});

export default SettingsPage;