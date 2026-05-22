import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    ScrollView, TextInput, ActivityIndicator,
    FlatList, RefreshControl, Platform, StatusBar,
    Modal,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { textStyles } from '@/constants/textStyles';
import Colors from '@/constants/Colors';
import { instance } from '@/store/api';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native';
import { useSelector } from 'react-redux';

import AdminFeedbackScreen from '../admin/adminfeedback'; // Импортируем экран отзывов

const Tab = createMaterialTopTabNavigator();

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminUser = {
    id: number;
    fullName: string;
    login: string;
    email: string;
    role: string;
    banned: boolean;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
    rose:        '#F87171',
    roseLight:   '#FEF2F2',
    roseBorder:  '#FECACA',
    roseMuted:   '#FBDADA',
    roseText:    '#B91C1C',

    sage:        '#4ADE80',
    sageLight:   '#F0FDF4',
    sageText:    '#166534',
    sageMuted:   '#DCFCE7',

    slate:       '#64748B',
    slateLight:  '#F8FAFC',
    slateMuted:  '#E2E8F0',

    amber:       '#FBBF24',
    amberLight:  '#FFFBEB',
    amberText:   '#92400E',
    amberMuted:  '#FDE68A',

    surface:     '#FFFFFF',
    bg:          '#F5F7FA',
    text:        '#1E293B',
    textSoft:    '#64748B',
};

// ─── Кастомный хук для модалки ошибок ────────────────────────────────────────
const useErrorModal = () => {
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
    const showError = (title: string, message: string) => setErrorModal({ title, message });
    const hideError = () => setErrorModal(null);
    return { errorModal, showError, hideError };
};

// ─── Компонент модалки ошибок ─────────────────────────────────────────────────
const ErrorModal = ({
    error,
    onClose,
    okLabel,
}: {
    error: { title: string; message: string } | null;
    onClose: () => void;
    okLabel: string;
}) => (
    <Modal visible={error !== null} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{error?.title}</Text>
                <Text style={{ color: T.textSoft, marginBottom: 16, lineHeight: 20 }}>
                    {error?.message}
                </Text>
                <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: Colors.greenFirst }]}
                    onPress={onClose}
                >
                    <Text style={{ color: 'white', fontWeight: '600' }}>{okLabel}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// ─── Компонент модалки подтверждения ─────────────────────────────────────────
type ConfirmModalState = {
    title: string;
    message: string;
    confirmLabel: string;
    destructive?: boolean;
    onConfirm: () => void;
} | null;

const ConfirmModal = ({
    confirm,
    onClose,
    cancelLabel,
}: {
    confirm: ConfirmModalState;
    onClose: () => void;
    cancelLabel: string;
}) => (
    <Modal visible={confirm !== null} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{confirm?.title}</Text>
                <Text style={{ color: T.textSoft, marginBottom: 16, lineHeight: 20 }}>
                    {confirm?.message}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: '#F2F2F7', flex: 1 }]}
                        onPress={onClose}
                    >
                        <Text style={{ color: Colors.text, fontWeight: '600' }}>{cancelLabel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modalBtn,
                            { flex: 1, backgroundColor: confirm?.destructive ? T.roseText : Colors.text },
                        ]}
                        onPress={() => {
                            const action = confirm?.onConfirm;
                            onClose();
                            setTimeout(() => { action?.(); }, 350);
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: '600' }}>{confirm?.confirmLabel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — Пользователи
// ═══════════════════════════════════════════════════════════════════════════════
const UsersTab = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const myId = useSelector((state: any) => state.user.userInfo?.id);

    const { errorModal, showError, hideError } = useErrorModal();
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);

    const [limitModal, setLimitModal] = useState<{ user: AdminUser } | null>(null);
    const [limitValue, setLimitValue] = useState('');
    const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await instance.get('api/admin/users');
            setUsers(res.data.filter((u: AdminUser) => u.id !== myId));
        } catch (e) {
            console.error(e);
            showError(t('admin.error'), t('admin.users.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t, myId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleBan = (user: AdminUser) => {
        const action = user.banned ? 'unban' : 'ban';
        setConfirmModal({
            title: user.banned ? t('admin.users.unbanTitle') : t('admin.users.banTitle'),
            message: `${user.fullName} (${user.login})`,
            confirmLabel: user.banned ? t('admin.users.unban') : t('admin.users.ban'),
            destructive: !user.banned,
            onConfirm: async () => {
                setActionLoading(user.id);
                try {
                    const res = await instance.post(`api/admin/users/${user.id}/${action}`);
                    console.log('✅ Ban OK:', res.status, res.data);
                    setUsers(prev =>
                        prev.map(u => u.id === user.id ? { ...u, banned: !u.banned } : u)
                    );
                } catch (e: any) {
                    console.log('❌ Ban ERROR:', e?.response?.status, e?.response?.data, e?.config?.url);
                    showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    const handleSetRole = (user: AdminUser) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        setConfirmModal({
            title: t('admin.users.changeRole'),
            message: t('admin.users.changeRoleMsg', { name: user.fullName, role: newRole }),
            confirmLabel: t('admin.users.assign'),
            onConfirm: async () => {
                setActionLoading(user.id);
                try {
                    await instance.post(`api/admin/users/${user.id}/role`, null, {
                        params: { role: newRole }
                    });
                    setUsers(prev =>
                        prev.map(u => u.id === user.id ? { ...u, role: newRole } : u)
                    );
                } catch (e: any) {
                    showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    const handleDelete = (user: AdminUser) => {
        setConfirmModal({
            title: t('admin.users.confirmDelete'),
            message: `${user.fullName} (${user.login})`,
            confirmLabel: t('admin.users.delete'),
            destructive: true,
            onConfirm: async () => {
                setActionLoading(user.id);
                try {
                    const res = await instance.delete(`api/admin/users/${user.id}`);
                    console.log('✅ DELETE OK:', res.status, res.data);
                    setUsers(prev => prev.filter(u => u.id !== user.id));
                } catch (e: any) {
                    console.log('❌ DELETE ERROR status:', e?.response?.status);
                    console.log('❌ DELETE ERROR data:', JSON.stringify(e?.response?.data));
                    console.log('❌ DELETE ERROR url:', e?.config?.url);
                    console.log('❌ DELETE ERROR message:', e?.message);
                    showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
                } finally {
                    setActionLoading(null);
                    setConfirmModal(null);
                }
            },
        });
    };

    const handleSetIndividualLimit = (user: AdminUser) => {
        setLimitValue('');
        setLimitModal({ user });
    };

    const confirmSetLimit = async () => {
        if (!limitModal) return;
        const limit = limitValue === '' ? null : parseInt(limitValue, 10);
        if (limitValue !== '' && (isNaN(limit!) || limit! < 1)) {
            showError(t('admin.error'), t('admin.users.invalidLimit'));
            return;
        }
        setActionLoading(limitModal.user.id);
        try {
            await instance.post(`api/admin/users/${limitModal.user.id}/daily-limit`, null, {
                params: { limit: limit ?? undefined }
            });
            setLimitModal(null);
            setSuccessModal({
                title: t('admin.done'),
                message: limit === null
                    ? t('admin.users.limitReset')
                    : t('admin.users.limitSet', { limit }),
            });
        } catch (e: any) {
            showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && users.length === 0) {
        return <View style={styles.center}><ActivityIndicator size="large" color={Colors.greenFirst} /></View>;
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.greenFirst} />
                }
                contentContainerStyle={{ padding: 16, gap: 10 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push(`/admin/user/${item.id}`)}
                    >
                        <View style={[styles.userCard, item.banned && styles.userCardBanned]}>
                            <View style={styles.userCardHeader}>
                                <View style={[
                                    styles.userAvatar,
                                    { backgroundColor: item.banned ? T.roseMuted : T.slateMuted }
                                ]}>
                                    <Text style={[
                                        styles.userAvatarText,
                                        { color: item.banned ? T.roseText : T.slate }
                                    ]}>
                                        {item.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </Text>
                                </View>

                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.userName}>{item.fullName}</Text>
                                    <Text style={styles.userMeta}>@{item.login} · #{item.id}</Text>
                                </View>

                                <View style={[
                                    styles.rolePill,
                                    item.role === 'ADMIN' && styles.rolePillAdmin,
                                ]}>
                                    <Text style={[
                                        styles.rolePillText,
                                        item.role === 'ADMIN' && styles.rolePillTextAdmin,
                                    ]}>
                                        {item.role}
                                    </Text>
                                </View>
                            </View>

                            {item.banned && (
                                <View style={styles.bannedStrip}>
                                    <Text style={styles.bannedStripText}>⚠ {t('admin.users.bannedLabel')}</Text>
                                </View>
                            )}

                            <View style={styles.cardDivider} />

                            {actionLoading === item.id ? (
                                <View style={styles.actionLoadingBox}>
                                    <ActivityIndicator size="small" color={Colors.greenFirst} />
                                </View>
                            ) : (
                                <View style={styles.userActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.actionChip,
                                            item.banned ? styles.chipGreen : styles.chipRose,
                                        ]}
                                        onPress={() => handleBan(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={[
                                            styles.actionChipText,
                                            { color: item.banned ? T.sageText : T.roseText },
                                        ]}>
                                            {item.banned ? t('admin.users.unban') : t('admin.users.ban')}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionChip, styles.chipSlate]}
                                        onPress={() => handleSetRole(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={[styles.actionChipText, { color: T.slate }]}>
                                            {item.role === 'ADMIN' ? '→ USER' : '→ ADMIN'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionChip, styles.chipAmber]}
                                        onPress={() => handleSetIndividualLimit(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={[styles.actionChipText, { color: T.amberText }]}>
                                            {t('admin.users.limit')}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionChip, styles.chipRoseSoft]}
                                        onPress={() => handleDelete(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={[styles.actionChipText, { color: T.roseText }]}>
                                            {t('admin.users.delete')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={[textStyles.body16Light, { color: T.textSoft }]}>
                            {t('admin.users.empty')}
                        </Text>
                    </View>
                }
            />

            {/* Модалка лимита */}
            <Modal visible={limitModal !== null} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>
                                {t('admin.users.individualLimit')}
                            </Text>
                            <Text style={{ color: T.textSoft, marginBottom: 12 }}>
                                {limitModal?.user.fullName}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={limitValue}
                                onChangeText={v => setLimitValue(v.replace(/[^0-9]/g, ''))}
                                placeholder={t('admin.limits.placeholder')}
                                keyboardType="numeric"
                                maxLength={3}
                                autoFocus
                                placeholderTextColor={Colors.grayDark ?? '#aaa'}
                            />
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: '#F2F2F7', flex: 1 }]}
                                    onPress={() => setLimitModal(null)}
                                >
                                    <Text style={{ color: Colors.text, fontWeight: '600' }}>
                                        {t('admin.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: Colors.greenFirst, flex: 1 }]}
                                    onPress={confirmSetLimit}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading !== null
                                        ? <ActivityIndicator color="white" />
                                        : <Text style={{ color: 'white', fontWeight: '600' }}>
                                            {t('admin.users.assign')}
                                          </Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <ErrorModal error={errorModal} onClose={hideError} okLabel="OK" />
            <ConfirmModal
                confirm={confirmModal}
                onClose={() => setConfirmModal(null)}
                cancelLabel={t('admin.cancel')}
            />
            <ErrorModal
                error={successModal}
                onClose={() => setSuccessModal(null)}
                okLabel="OK"
            />
        </View>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Лимиты
// ═══════════════════════════════════════════════════════════════════════════════
const PRESETS = [5, 10, 15, 20, 25, 50];

const LimitsTab = () => {
    const { t } = useTranslation();
    const [globalLimit, setGlobalLimit] = useState<number | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<number>(10);
    const [customLimit, setCustomLimit] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const { errorModal, showError, hideError } = useErrorModal();
    const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

    const fetchGlobalLimit = useCallback(async () => {
        try {
            setLoading(true);
            const res = await instance.get('api/admin/settings/daily-limit');
            const limit = res.data?.limit ?? res.data;
            setGlobalLimit(limit);
            setSelectedPreset(limit);
        } catch (e: any) {
            showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchGlobalLimit(); }, []);

    const effectiveLimit = customLimit ? parseInt(customLimit, 10) : selectedPreset;

    const handleSave = async () => {
        if (!effectiveLimit || isNaN(effectiveLimit) || effectiveLimit < 1 || effectiveLimit > 999) {
            showError(t('admin.error'), t('admin.limits.rangeError'));
            return;
        }
        setSaving(true);
        try {
            await instance.post('api/admin/settings/daily-limit', null, {
                params: { limit: effectiveLimit }
            });
            setGlobalLimit(effectiveLimit);
            setSuccessModal({
                title: t('admin.done'),
                message: t('admin.limits.saved', { limit: effectiveLimit }),
            });
        } catch (e: any) {
            showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={Colors.greenFirst} /></View>;
    }

    return (
        <>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={styles.card}>
                    <Text style={[textStyles.body16Light, { color: Colors.grayDark, marginBottom: 16, lineHeight: 22 }]}>
                        {t('admin.limits.description')}
                    </Text>
                    <View style={styles.currentRow}>
                        <Text style={[textStyles.body16Light, { color: Colors.grayDark }]}>
                            {t('admin.limits.current')}
                        </Text>
                        <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>{globalLimit ?? '—'}</Text>
                        </View>
                    </View>
                    <Text style={styles.subLabel}>{t('admin.limits.quickPick')}</Text>
                    <View style={styles.presets}>
                        {PRESETS.map((val) => (
                            <TouchableOpacity
                                key={val}
                                style={[styles.preset, selectedPreset === val && !customLimit && styles.presetActive]}
                                onPress={() => { setSelectedPreset(val); setCustomLimit(''); }}
                            >
                                <Text style={[textStyles.body16Light, {
                                    color: selectedPreset === val && !customLimit ? 'white' : Colors.text,
                                }]}>
                                    {val}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.subLabel}>{t('admin.limits.orCustom')}</Text>
                    <TextInput
                        style={styles.input}
                        value={customLimit}
                        onChangeText={(v) => {
                            setCustomLimit(v.replace(/[^0-9]/g, ''));
                            setSelectedPreset(0);
                        }}
                        placeholder={t('admin.limits.placeholder')}
                        keyboardType="numeric"
                        maxLength={3}
                        placeholderTextColor={Colors.grayDark ?? '#aaa'}
                    />
                    {effectiveLimit > 0 && (
                        <View style={styles.preview}>
                            <Text style={[textStyles.body16Light, { color: Colors.grayDark }]}>
                                {t('admin.limits.newLimit')}
                            </Text>
                            <Text style={[textStyles.body16Light, { color: Colors.text, marginLeft: 8, fontWeight: '600' }]}>
                                {t('admin.limits.perDay', { limit: effectiveLimit })}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.saveBtnText}>{t('admin.limits.save')}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ErrorModal error={errorModal} onClose={hideError} okLabel="OK" />
            <ErrorModal
                error={successModal}
                onClose={() => setSuccessModal(null)}
                okLabel="OK"
            />
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
    const { t } = useTranslation();

    return (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight }}>
            <SafeAreaView style={styles.header}>
                <View style={styles.header}>
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>{t('admin.title')}</Text>
                    </View>
                </View>
            </SafeAreaView>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: Colors.text,
                    tabBarInactiveTintColor: Colors.grayDark,
                    tabBarStyle: { backgroundColor: 'white', elevation: 0, shadowOpacity: 0 },
                    tabBarIndicatorStyle: { backgroundColor: Colors.greenFirst },
                    tabBarLabelStyle: { fontFamily: 'futuraPTLight', fontSize: 12 },
                }}
            >
                <Tab.Screen name="Users" component={UsersTab} options={{ tabBarLabel: t('admin.tabs.users') }} />
                <Tab.Screen name="Feedbacks" component={AdminFeedbackScreen} options={{ tabBarLabel: t('admin.tabs.feedbacks') }} />
                <Tab.Screen name="Limits" component={LimitsTab} options={{ tabBarLabel: t('admin.tabs.limits') }} />
            </Tab.Navigator>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    adminBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    adminBadgeText: { color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

    userCard: {
        backgroundColor: T.surface,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: T.slateMuted,
    },
    userCardBanned: {
        backgroundColor: T.roseLight,
        borderColor: T.roseBorder,
    },
    userCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    userAvatarText: { fontSize: 16, fontWeight: '700' },
    userName: { fontSize: 15, fontWeight: '600', color: T.text, letterSpacing: -0.2 },
    userMeta: { fontSize: 12, color: T.textSoft, marginTop: 2 },

    rolePill: {
        backgroundColor: T.slateLight,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: T.slateMuted,
    },
    rolePillAdmin: { backgroundColor: '#FFF7ED', borderColor: T.amberMuted },
    rolePillText: { fontSize: 10, fontWeight: '700', color: T.slate, letterSpacing: 0.5 },
    rolePillTextAdmin: { color: T.amberText },

    bannedStrip: {
        marginTop: 10,
        backgroundColor: T.roseMuted,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
    },
    bannedStripText: { fontSize: 11, fontWeight: '700', color: T.roseText },

    cardDivider: { height: 1, backgroundColor: T.slateMuted, marginVertical: 12, opacity: 0.6 },
    actionLoadingBox: { alignItems: 'center', paddingVertical: 8 },

    userActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    actionChip: {
        paddingVertical: 7, paddingHorizontal: 12,
        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    actionChipText: { fontSize: 12, fontWeight: '600' },
    chipRose: { backgroundColor: T.roseMuted },
    chipRoseSoft: { backgroundColor: T.roseLight, borderWidth: 1, borderColor: T.roseBorder },
    chipGreen: { backgroundColor: T.sageMuted },
    chipSlate: { backgroundColor: T.slateLight, borderWidth: 1, borderColor: T.slateMuted },
    chipAmber: { backgroundColor: T.amberLight, borderWidth: 1, borderColor: T.amberMuted },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: 'white', borderRadius: 20,
        padding: 20, margin: 16, marginBottom: 32,
    },
    modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12, color: Colors.text },
    modalBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },

    card: {
        backgroundColor: 'white', borderRadius: 14, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    currentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
    currentBadge: {
        backgroundColor: Colors.text ?? '#1a1a1a',
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
    },
    currentBadgeText: { color: 'white', fontSize: 16, fontWeight: '600' },
    subLabel: { color: Colors.grayDark ?? '#888', fontSize: 13, marginBottom: 8, marginTop: 4 },
    presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    preset: {
        width: 52, height: 44, borderRadius: 10,
        borderWidth: 1, borderColor: '#ddd',
        backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    },
    presetActive: { backgroundColor: Colors.text ?? '#1a1a1a', borderColor: Colors.text ?? '#1a1a1a' },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 16, fontFamily: 'futuraPTLight',
        color: Colors.text, backgroundColor: 'white',
    },
    preview: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: 12, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 10,
    },
    saveBtn: {
        marginTop: 20, backgroundColor: Colors.greenFirst ?? '#4CAF50',
        borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default AdminPanel;