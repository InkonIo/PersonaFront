import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { instance } from '@/store/api';
import Colors from '@/constants/Colors';

// ─── Types ────────────────────────────────────────────────────────────────────
type DayEntry   = { date: string; count: number };
type CityEntry  = { city: string; count: number };

type Statistics = {
    totalUsers:        number;
    bannedUsers:       number;
    mentors:           number;
    onlineNow:         number;
    newToday:          number;
    totalFeedbacks:    number;
    unreadFeedbacks:   number;
    registrationsByDay: DayEntry[];
    topCities:          CityEntry[];
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
    bg:         '#F5F7FA',
    surface:    '#FFFFFF',
    text:       '#1E293B',
    textSoft:   '#64748B',
    border:     '#E2E8F0',

    blue:       '#3B82F6',
    blueLight:  '#EFF6FF',
    blueText:   '#1D4ED8',

    rose:       '#F87171',
    roseLight:  '#FEF2F2',
    roseText:   '#B91C1C',

    sage:       '#4ADE80',
    sageLight:  '#F0FDF4',
    sageText:   '#166534',
    sageMuted:  '#DCFCE7',

    amber:      '#FBBF24',
    amberLight: '#FFFBEB',
    amberText:  '#92400E',

    purple:     '#A78BFA',
    purpleLight:'#F5F3FF',
    purpleText: '#5B21B6',

    slate:      '#94A3B8',
    slateLight: '#F8FAFC',
};

const fmtDay = (dateStr: string): string => {
    try {
        const [, month, day] = dateStr.split('-');
        return `${day}.${month}`;  // → "29.05"
    } catch {
        return dateStr;
    }
};

// ─── Карточка метрики ─────────────────────────────────────────────────────────
const MetricCard = ({
    label,
    value,
    accent,
    bg,
}: {
    label: string;
    value: number | string;
    accent: string;
    bg: string;
}) => (
    <View style={[mcStyles.card, { backgroundColor: bg }]}>
        <Text style={[mcStyles.value, { color: accent }]}>{value}</Text>
        <Text style={mcStyles.label}>{label}</Text>
    </View>
);

const mcStyles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        minWidth: '47%',
        gap: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    label: {
        fontSize: 12,
        color: T.textSoft,
        fontFamily: 'futuraPTLight',
        lineHeight: 16,
    },
});

// ─── Бар-чарт (горизонтальные столбцы) ───────────────────────────────────────
const BAR_HEIGHT = 20;
const BAR_RADIUS = 6;

const BarChart = ({
    data,
    color,
    labelKey,
    valueKey,
    maxBars = 7,
}: {
    data: any[];
    color: string;
    labelKey: string;
    valueKey: string;
    maxBars?: number;
}) => {
    const sliced = data.slice(-maxBars).map(item => ({
    ...item,
    [labelKey]: labelKey === 'date' ? fmtDay(item[labelKey]) : item[labelKey],
}));
    const max    = Math.max(...sliced.map(d => d[valueKey]), 1);

    return (
        <View style={{ gap: 8 }}>
            {sliced.map((item, i) => {
                const pct = (item[valueKey] / max) * 100;
                return (
                    <View key={i} style={bcStyles.row}>
                        <Text style={bcStyles.label} numberOfLines={1}>
                            {item[labelKey]}
                        </Text>
                        <View style={bcStyles.track}>
                            <View
                                style={[
                                    bcStyles.bar,
                                    {
                                        width: `${Math.max(pct, 4)}%`,
                                        backgroundColor: color,
                                        borderRadius: BAR_RADIUS,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={bcStyles.val}>{item[valueKey]}</Text>
                    </View>
                );
            })}
        </View>
    );
};

const bcStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        width: 36,
        fontSize: 11,
        color: T.textSoft,
        fontFamily: 'futuraPTLight',
        textAlign: 'right',
    },
    track: {
        flex: 1,
        height: BAR_HEIGHT,
        backgroundColor: T.border,
        borderRadius: BAR_RADIUS,
        overflow: 'hidden',
    },
    bar: {
        height: BAR_HEIGHT,
    },
    val: {
        width: 28,
        fontSize: 11,
        color: T.textSoft,
        textAlign: 'right',
        fontFamily: 'futuraPTLight',
    },
});

// ─── Секция-карточка ──────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={secStyles.card}>
        <Text style={secStyles.title}>{title}</Text>
        {children}
    </View>
);

const secStyles = StyleSheet.create({
    card: {
        backgroundColor: T.surface,
        borderRadius: 18,
        padding: 16,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: T.border,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: T.text,
        marginBottom: 16,
        letterSpacing: -0.2,
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminStatisticsScreen() {
    const { t } = useTranslation();
    const [stats, setStats]         = useState<Statistics | null>(null);
    const [loading, setLoading]     = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await instance.get('api/admin/statistics');
            setStats(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? t('admin.unknownError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    useEffect(() => { fetchStats(); }, []);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading && !stats) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.greenFirst} />
            </View>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error && !stats) {
        return (
            <View style={styles.center}>
                <Text style={{ color: T.roseText, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
                    {error}
                </Text>
                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={fetchStats}
                >
                    <Text style={{ color: 'white', fontWeight: '600' }}>
                        {t('admin.stats.retry')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!stats) return null;

    const regDays  = stats.registrationsByDay ?? [];
    const cities   = stats.topCities ?? [];

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: T.bg }}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.greenFirst}
                />
            }
        >
            {/* ── Пользователи ─────────────────────────────────────────────── */}
            <Section title={t('admin.stats.users')}>
                <View style={styles.grid}>
                    <MetricCard
                        label={t('admin.stats.totalUsers')}
                        value={stats.totalUsers}
                        accent={T.blueText}
                        bg={T.blueLight}
                    />
                    <MetricCard
                        label={t('admin.stats.newToday')}
                        value={stats.newToday}
                        accent={T.sageText}
                        bg={T.sageLight}
                    />
                    <MetricCard
                        label={t('admin.stats.onlineNow')}
                        value={stats.onlineNow}
                        accent={T.purpleText}
                        bg={T.purpleLight}
                    />
                    <MetricCard
                        label={t('admin.stats.bannedUsers')}
                        value={stats.bannedUsers}
                        accent={T.roseText}
                        bg={T.roseLight}
                    />
                </View>
            </Section>

            {/* ── Обратная связь ───────────────────────────────────────────── */}
            <Section title={t('admin.stats.feedbacks')}>
                <View style={styles.grid}>
                    <MetricCard
                        label={t('admin.stats.totalFeedbacks')}
                        value={stats.totalFeedbacks}
                        accent={T.blueText}
                        bg={T.blueLight}
                    />
                    <MetricCard
                        label={t('admin.stats.unreadFeedbacks')}
                        value={stats.unreadFeedbacks}
                        accent={T.roseText}
                        bg={T.roseLight}
                    />
                </View>
            </Section>

            {/* ── Регистрации по дням ──────────────────────────────────────── */}
            {regDays.length > 0 && (
                <Section title={t('admin.stats.regByDay')}>
                    <BarChart
                        data={regDays}
                        color={T.blue}
                        labelKey="date"
                        valueKey="count"
                        maxBars={10}
                    />
                </Section>
            )}

            {/* ── Топ городов ──────────────────────────────────────────────── */}
            {cities.length > 0 && (
                <Section title={t('admin.stats.topCities')}>
                    <BarChart
                        data={cities}
                        color={Colors.greenFirst ?? '#4ADE80'}
                        labelKey="city"
                        valueKey="count"
                        maxBars={8}
                    />
                </Section>
            )}

            {/* Отступ снизу */}
            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

// ─── Стили ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    retryBtn: {
        backgroundColor: Colors.greenFirst,
        borderRadius: 10,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
});