import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, SafeAreaView, Image,
    StatusBar,
    Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { instance } from '@/store/api';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, PencilIcon } from 'lucide-react-native';

const BASE_URL = "http://91.224.74.12:8080/api";

export default function AdminUserDetailScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUser(); }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await instance.get(`${BASE_URL}/admin/users/${id}`);
            setUser(res.data);
        } catch {
            Alert.alert(t('adminUserDetail.errorTitle'), t('adminUserDetail.errorLoad'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={Colors.greenFirst} />
            </SafeAreaView>
        </>
    );

    if (!user) return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.center}>
                <Text style={{ fontSize: 16, color: Colors.grayDark }}>
                    {t('adminUserDetail.notFound')}
                </Text>
            </SafeAreaView>
        </>
    );

    const infoFields = [
        { label: t('adminUserDetail.fullName'), value: user.fullName,              icon: '👤' },
        { label: t('adminUserDetail.email'),    value: user.email,                 icon: '📧' },
        { label: t('adminUserDetail.hobby'),    value: user.hobby,                 icon: '🎯' },
        { label: t('adminUserDetail.dreamWork'),value: user.dreamWork,             icon: '💼' },
        { label: t('adminUserDetail.education'),value: user.educationAndCourses,   icon: '🎓' },
        { label: t('adminUserDetail.skills'),   value: user.experienceAndSkills,   icon: '⚡' },
    ];

    const readonlyFields = [
        { label: t('adminUserDetail.city'),       value: user.city?.nameRu,   icon: '📍' },
        { label: t('adminUserDetail.country'),    value: user.country?.nameRu,icon: '🌍' },
        { label: t('adminUserDetail.dateOfBirth'),value: user.dateOfBirth,    icon: '🎂' },
        { label: t('adminUserDetail.visibility'), value: user.visible ? t('adminUserDetail.visible') : t('adminUserDetail.hidden'), icon: '👁' },
    ];

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Hero */}
                    <View style={styles.heroCard}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <ChevronLeftIcon size={20} color="#fff" />
                            <Text style={styles.backBtnText}>{t('common.back')}</Text>
                        </TouchableOpacity>

                        {user.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.heroName}>{user.fullName || '—'}</Text>
                        <Text style={styles.heroLogin}>@{user.login}</Text>

                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, user.role === 'ADMIN' && styles.badgeAdmin]}>
                                <Text style={styles.badgeText}>{user.role}</Text>
                            </View>
                            <View style={[styles.badge, !user.visible && styles.badgeHidden]}>
                                <Text style={styles.badgeText}>
                                    {user.visible ? t('adminUserDetail.visible') : t('adminUserDetail.hidden')}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.heroId}>ID: {user.id}</Text>
                    </View>

                    {/* Кнопка редактировать */}
                    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => router.push(`/admin/edit/${id}` as any)}
                        >
                            <PencilIcon size={16} color="#fff" />
                            <Text style={styles.editBtnText}>{t('adminUserDetail.editBtn')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Основные поля */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('adminUserDetail.sectionMain')}</Text>
                        {infoFields.map(({ label, value, icon }) => (
                            <View key={label} style={styles.fieldCard}>
                                <Text style={styles.fieldLabel}>{icon}  {label}</Text>
                                <Text style={styles.fieldValue}>{value || '—'}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Readonly */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('adminUserDetail.sectionExtra')}</Text>
                        <View style={styles.readonlyGrid}>
                            {readonlyFields.map(({ label, value, icon }) => (
                                <View key={label} style={styles.readonlyCard}>
                                    <Text style={styles.readonlyIcon}>{icon}</Text>
                                    <Text style={styles.readonlyValue}>{value || '—'}</Text>
                                    <Text style={styles.readonlyLabel}>{label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },

    heroCard: {
    backgroundColor: Colors.greenFirst,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 16, // ← вот это
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
},
    backBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 16,
        marginBottom: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    backBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    avatarImage: {
        width: 90, height: 90, borderRadius: 45,
        marginBottom: 12,
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: { fontSize: 36, color: '#fff', fontWeight: '700' },
    heroName: { fontSize: 20, fontWeight: '700', color: '#fff' },
    heroLogin: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    heroId: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 6 },

    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    badge: {
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    badgeAdmin: { backgroundColor: '#ff6b35' },
    badgeHidden: { backgroundColor: '#e53e3e' },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    editBtn: {
        backgroundColor: Colors.greenFirst,
        borderRadius: 14,
        paddingVertical: 13,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    editBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: Colors.grayDark,
        textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
    },

    fieldCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    fieldLabel: { fontSize: 11, color: Colors.grayDark, marginBottom: 5, fontWeight: '600' },
    fieldValue: { fontSize: 15, color: Colors.text ?? '#1E293B' },

    readonlyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    readonlyCard: {
        backgroundColor: '#fff', borderRadius: 14,
        padding: 14, alignItems: 'center', width: '47%',
        shadowColor: '#94A3B8', shadowOpacity: 0.07,
        shadowRadius: 6, elevation: 1,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    readonlyIcon: { fontSize: 24, marginBottom: 6 },
    readonlyValue: { fontSize: 14, fontWeight: '600', color: Colors.text ?? '#1E293B', textAlign: 'center' },
    readonlyLabel: { fontSize: 11, color: Colors.grayDark, marginTop: 2, textAlign: 'center' },
});