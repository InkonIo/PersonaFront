import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { instance } from '@/store/api';
import Colors from '@/constants/Colors';
import { textStyles } from '@/constants/textStyles';

// ─── Types ────────────────────────────────────────────────────────────────────
type Feedback = {
    id: number;
    message: string;
    createdAt: string;
    adminReply?: string;
    repliedAt?: string;
    isRead: boolean;
    userId: number;
    userLogin?: string;
};

// ─── Хук для модалки ошибок ───────────────────────────────────────────────────
const useErrorModal = () => {
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
    const showError = (title: string, message: string) => setErrorModal({ title, message });
    const hideError = () => setErrorModal(null);
    return { errorModal, showError, hideError };
};

// ─── Модалка ошибок / успеха ──────────────────────────────────────────────────
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
                <Text style={{ color: '#64748B', marginBottom: 16, lineHeight: 20 }}>
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

// ─── Утилита форматирования даты ──────────────────────────────────────────────
const formatDate = (createdAt: any): string => {
    if (Array.isArray(createdAt)) {
        const [year, month, day, hour, minute] = createdAt;
        const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }
    return String(createdAt);
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminFeedbackScreen() {
    const { t } = useTranslation();

    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [markingId, setMarkingId] = useState<number | null>(null);

    // Reply modal state
    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const { errorModal, showError, hideError } = useErrorModal();
    const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchFeedbacks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await instance.get('api/admin/feedbacks');
            setFeedbacks(res.data);
        } catch (e: any) {
            showError(t('admin.error'), e?.response?.data?.message ?? t('admin.feedbacks.loadError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFeedbacks();
        setRefreshing(false);
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    // ── Mark read ─────────────────────────────────────────────────────────────
    const handleMarkRead = async (id: number) => {
        setMarkingId(id);
        try {
            await instance.post(`api/admin/feedbacks/${id}/read`);
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, isRead: true } : f));
        } catch (e: any) {
            showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
        } finally {
            setMarkingId(null);
        }
    };

    // ── Close reply modal — клавиатура сначала, потом Modal ──────────────────
    const closeReplyModal = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            setReplyingId(null);
            setReplyText('');
        }, Platform.OS === 'android' ? 300 : 50);
    };

    // ── Send reply ────────────────────────────────────────────────────────────
    // Изменения в sendReply:
const sendReply = async () => {
    if (!replyText.trim() || sendingReply) return;

    const id = replyingId;
    const text = replyText.trim();

    setSendingReply(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
        await instance.post(
            `api/admin/feedbacks/${id}/reply`,
            { message: text },
            { signal: controller.signal },
        );

        setFeedbacks(prev =>
            prev.map(f => f.id === id
                ? { ...f, isRead: true, adminReply: text, repliedAt: new Date().toISOString() }
                : f
            ),
        );

        // ❌ Убери closeReplyModal() здесь — не закрывай сам
        // Вместо этого просто сбрось текст, Modal закроется через onDismiss
        setReplyText('');
        setReplyingId(null);   // ← закрываем Modal синхронно

        // ✅ Показываем success ПОСЛЕ того как replyingId стал null
        // используем setTimeout чтобы дать Modal время анимации закрыться
        setTimeout(() => {
            setSuccessModal({
                title: t('admin.feedbacks.replySentTitle'),
                message: t('admin.feedbacks.replySentMsg'),
            });
        }, Platform.OS === 'android' ? 350 : 100);

    } catch (e: any) {
        if (e?.code === 'ERR_CANCELED' || e?.name === 'AbortError') {
            showError(t('admin.error'), t('admin.feedbacks.timeout'));
        } else {
            showError(t('admin.error'), e?.response?.data?.message ?? t('admin.unknownError'));
        }
    } finally {
        clearTimeout(timeout);
        setSendingReply(false);
    }
};

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading && feedbacks.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.greenFirst} />
            </View>
        );
    }

    // ── Render item ───────────────────────────────────────────────────────────
    const renderItem = ({ item }: { item: Feedback }) => (
        <View style={[styles.feedbackCard, item.isRead && styles.feedbackCardRead]}>
            <View style={styles.feedbackHeader}>
                <Text style={[textStyles.body12Light, { color: Colors.grayDark }]}>
                    ID {item.userId}{item.userLogin ? ` · @${item.userLogin}` : ''}
                </Text>
                <Text style={[textStyles.body12Light, { color: Colors.grayDark }]}>
                    {formatDate(item.createdAt)}
                </Text>
            </View>

            <Text style={[textStyles.body16Light, { color: Colors.text, marginTop: 8, lineHeight: 22 }]}>
                {item.message}
            </Text>

            {/* Показываем ранее отправленный ответ */}
            {item.adminReply && (
                <View style={styles.replyPreview}>
                    <Text style={styles.replyPreviewLabel}>
                        {t('admin.feedbacks.yourReply')}
                    </Text>
                    <Text style={styles.replyPreviewText}>{item.adminReply}</Text>
                </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {!item.isRead && (
                    <TouchableOpacity
                        style={[styles.markReadBtn, { flex: 1 }]}
                        onPress={() => handleMarkRead(item.id)}
                        disabled={markingId === item.id}
                    >
                        {markingId === item.id
                            ? <ActivityIndicator size="small" color="white" />
                            : <Text style={styles.markReadText}>{t('admin.feedbacks.markRead')}</Text>
                        }
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.replyBtn, { flex: 1 }]}
                    onPress={() => { setReplyingId(item.id); setReplyText(''); }}
                >
                    <Text style={styles.replyBtnText}>✉️ {t('admin.feedbacks.reply')}</Text>
                </TouchableOpacity>
            </View>

            {item.isRead && (
                <Text style={styles.readLabel}>✓ {t('admin.feedbacks.read')}</Text>
            )}
        </View>
    );

    // ── UI ────────────────────────────────────────────────────────────────────
    return (
        <>
            <FlatList
                data={feedbacks}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.greenFirst}
                    />
                }
                contentContainerStyle={{ padding: 16 }}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={[textStyles.body16Light, { color: Colors.grayDark }]}>
                            {t('admin.feedbacks.empty')}
                        </Text>
                    </View>
                }
            />

            {/* ── Reply modal ─────────────────────────────────────────────── */}
            <Modal
                visible={replyingId !== null}
                transparent
                animationType="slide"
                hardwareAccelerated
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>{t('admin.feedbacks.replyTitle')}</Text>
                            <TextInput
                                style={styles.replyInput}
                                value={replyText}
                                onChangeText={setReplyText}
                                placeholder={t('admin.feedbacks.replyPlaceholder')}
                                multiline
                                numberOfLines={5}
                                autoFocus
                                textAlignVertical="top"
                                placeholderTextColor={Colors.grayDark ?? '#aaa'}
                            />
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: '#F2F2F7', flex: 1 }]}
                                    onPress={closeReplyModal}
                                >
                                    <Text style={{ color: Colors.text, fontWeight: '600' }}>
                                        {t('admin.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, {
                                        backgroundColor: replyText.trim() && !sendingReply
                                            ? Colors.greenFirst
                                            : '#ccc',
                                        flex: 2,
                                    }]}
                                    onPress={sendReply}
                                    disabled={sendingReply || !replyText.trim()}
                                >
                                    {sendingReply
                                        ? <ActivityIndicator color="white" />
                                        : <Text style={{ color: 'white', fontWeight: '600' }}>
                                            {t('admin.feedbacks.sendEmail')}
                                          </Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Error modal ─────────────────────────────────────────────── */}
            <ErrorModal error={errorModal} onClose={hideError} okLabel="OK" />

            {/* ── Success modal ───────────────────────────────────────────── */}
            <ErrorModal
                error={successModal}
                onClose={() => setSuccessModal(null)}
                okLabel="OK"
            />
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    center: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
    },
    feedbackCard: {
        backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
        borderLeftWidth: 3, borderLeftColor: Colors.greenFirst ?? '#4CAF50',
    },
    feedbackCardRead: {
        borderLeftColor: '#E5E5EA', opacity: 0.7,
    },
    feedbackHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
    },
    replyPreview: {
        marginTop: 8, padding: 8,
        backgroundColor: '#f0f9f0', borderRadius: 8,
    },
    replyPreviewLabel: {
        fontSize: 11, color: Colors.greenFirst, fontWeight: '600',
    },
    replyPreviewText: {
        fontSize: 13, color: Colors.text, marginTop: 2,
    },
    markReadBtn: {
        backgroundColor: Colors.greenFirst ?? '#4CAF50',
        borderRadius: 8, paddingVertical: 8, alignItems: 'center',
    },
    markReadText: {
        color: 'white', fontSize: 13, fontWeight: '600',
    },
    readLabel: {
        marginTop: 8, fontSize: 12, color: '#34C759', fontWeight: '600',
    },
    replyBtn: {
        borderWidth: 1, borderColor: Colors.greenFirst ?? '#4CAF50',
        borderRadius: 8, paddingVertical: 8, alignItems: 'center',
    },
    replyBtnText: {
        color: Colors.greenFirst ?? '#4CAF50', fontWeight: '600', fontSize: 13,
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: 'white', borderRadius: 20,
        padding: 20, margin: 16, marginBottom: 32,
    },
    modalTitle: {
        fontWeight: '700', fontSize: 16, marginBottom: 12, color: Colors.text,
    },
    replyInput: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
        padding: 12, fontSize: 15, minHeight: 120,
        fontFamily: 'futuraPTLight', color: Colors.text,
    },
    modalBtn: {
        paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    },
});