import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator,
    Platform, StatusBar,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { instance } from '@/store/api';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon } from 'lucide-react-native';

const BASE_URL = "http://91.224.74.12:8080/api";

export default function AdminEditUserScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [hobby, setHobby] = useState('');
    const [dreamWork, setDreamWork] = useState('');
    const [education, setEducation] = useState('');
    const [skills, setSkills] = useState('');

    useEffect(() => { fetchUser(); }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await instance.get(`${BASE_URL}/admin/users/${id}`);
            const data = res.data;
            setFullName(data.fullName || '');
            setEmail(data.email || '');
            setHobby(data.hobby || '');
            setDreamWork(data.dreamWork || '');
            setEducation(data.educationAndCourses || '');
            setSkills(data.experienceAndSkills || '');
        } catch {
            Alert.alert(t('adminUserDetail.errorTitle'), t('adminUserDetail.errorLoad'));
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await instance.patch(`${BASE_URL}/admin/users/${id}`, {
                fullName, email, hobby, dreamWork,
                educationAndCourses: education,
                experienceAndSkills: skills,
            });
            Alert.alert(t('adminUserDetail.successTitle'), t('adminUserDetail.successMsg'));
            router.back();
        } catch {
            Alert.alert(t('adminUserDetail.errorTitle'), t('adminUserDetail.errorSave'));
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { label: t('adminUserDetail.fullName'), value: fullName, setter: setFullName, icon: '👤', keyboard: 'default' as const },
        { label: t('adminUserDetail.email'),    value: email,    setter: setEmail,    icon: '📧', keyboard: 'email-address' as const },
        { label: t('adminUserDetail.hobby'),    value: hobby,    setter: setHobby,    icon: '🎯', keyboard: 'default' as const },
        { label: t('adminUserDetail.dreamWork'),value: dreamWork,setter: setDreamWork,icon: '💼', keyboard: 'default' as const },
        { label: t('adminUserDetail.education'),value: education,setter: setEducation,icon: '🎓', keyboard: 'default' as const },
        { label: t('adminUserDetail.skills'),   value: skills,   setter: setSkills,   icon: '⚡', keyboard: 'default' as const },
    ];

    if (loading) return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.greenFirst} />
            </View>
        </>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>

                <View style={{ paddingTop: 30, backgroundColor: '#fff' }}>
    <TouchableOpacity onPress={() => router.back()}>
        <ChevronLeftIcon size={22} color={Colors.text} />
    </TouchableOpacity>
</View>

                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 48 }}>
                    <Text style={styles.sectionTitle}>{t('adminUserDetail.sectionMain')}</Text>

                    {fields.map(({ label, value, setter, icon, keyboard }) => (
                        <View key={label} style={styles.fieldCard}>
                            <Text style={styles.fieldLabel}>{icon}  {label}</Text>
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={setter}
                                placeholder={label}
                                placeholderTextColor={Colors.grayDark}
                                keyboardType={keyboard}
                                autoCapitalize="none"
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.saveBtnText}>✓  {t('adminUserDetail.saveBtn')}</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => router.back()}
                        disabled={saving}
                    >
                        <Text style={styles.cancelBtnText}>{t('admin.cancel')}</Text>
                    </TouchableOpacity>
                </ScrollView>

            </View>
        </>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: {
        width: 40, height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: -0.3,
    },

    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.grayDark,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
        marginTop: 4,
    },

    fieldCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    fieldLabel: {
        fontSize: 11,
        color: Colors.grayDark,
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    input: {
        fontSize: 15,
        color: Colors.text,
        paddingVertical: 0,
    },

    saveBtn: {
        backgroundColor: Colors.greenFirst,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 24,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },

    cancelBtn: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#F1F5F9',
    },
    cancelBtnText: {
        color: Colors.grayDark,
        fontWeight: '600',
        fontSize: 15,
    },
});