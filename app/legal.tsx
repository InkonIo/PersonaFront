import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

type TabKey = 'privacy' | 'agreement' | 'requisites';

const REQUISITES_KEYS = [
    { labelKey: 'legal.req_beneficiary', valueKey: 'legal.req_beneficiary_val' },
    { labelKey: 'legal.req_bin',         valueKey: 'legal.req_bin_val' },
    { labelKey: 'legal.req_account',     valueKey: 'legal.req_account_val' },
    { labelKey: 'legal.req_bank',        valueKey: 'legal.req_bank_val' },
    { labelKey: 'legal.req_bic',         valueKey: 'legal.req_bic_val' },
    { labelKey: 'legal.req_kbe',         valueKey: 'legal.req_kbe_val' },
];

const Legal = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabKey>('privacy');

    const tabs: { key: TabKey; label: string }[] = [
        { key: 'privacy',    label: t('legal.privacy') },
        { key: 'agreement',  label: t('legal.agreement') },
        { key: 'requisites', label: t('legal.requisites') },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'privacy' && (
                    <Text style={styles.body}>{t('legal.privacyText')}</Text>
                )}
                {activeTab === 'agreement' && (
                    <Text style={styles.body}>{t('legal.agreementText')}</Text>
                )}
                {activeTab === 'requisites' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('legal.req_title')}</Text>
                        {REQUISITES_KEYS.map(({ labelKey, valueKey }) => (
                            <View key={labelKey} style={styles.row}>
                                <Text style={styles.rowLabel}>{t(labelKey)}</Text>
                                <Text style={styles.rowValue}>{t(valueKey)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white ?? '#fff' },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: Colors.greenSecond,
    },
    tabText: {
        fontSize: 13,
        color: '#888',
    },
    tabTextActive: {
        color: Colors.greenSecond,
        fontWeight: '500',
    },
    content: { padding: 16 },
    body: { fontSize: 14, lineHeight: 22, color: '#333' },

    card: {
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#E0E0E0',
        padding: 16,
        gap: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    rowLabel: {
        fontSize: 13,
        color: '#888',
        flex: 1,
    },
    rowValue: {
        fontSize: 13,
        color: '#111',
        fontWeight: '500',
        flex: 1.5,
        textAlign: 'right',
    },
});

export default Legal;