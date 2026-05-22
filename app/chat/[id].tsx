import { useCallback, useEffect, useRef, useState } from 'react';
import {
    SafeAreaView, StyleSheet, Text, View, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocket } from "@/app/WebSocketContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getChatMessages, readMessages, getMyChats, sendMessage } from "@/store/slices/chatSlice";
import { getUserInfoById } from "@/store/slices/profileSlice";
import { addHours, format, parse, isValid, isSameDay } from "date-fns";
import { ru } from 'date-fns/locale';
import { toZonedTime } from "date-fns-tz";
import uuid from 'react-native-uuid';
import { setChatOpen } from '@/store/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';
import ErrorModal from '@/components/ErrorModal';

const HOT_CACHE = new Map<string, ChatMessage[]>();

const parseDateString = (dateString: string | undefined): Date => {
    if (typeof dateString === 'string' && dateString.match(/\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/)) {
        const parsed = parse(dateString, 'dd-MM-yyyy HH:mm:ss', new Date());
        return isValid(parsed) ? addHours(parsed, 5) : new Date();
    }
    return new Date();
};

const cacheKey = (id: string) => `chat_messages_${id}`;

const readWarmCache = async (id: string): Promise<ChatMessage[] | null> => {
    try {
        const raw = await AsyncStorage.getItem(cacheKey(id));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed.map((msg: any) => ({ ...msg, createdAt: new Date(msg.createdAt) }));
    } catch { return null; }
};

const writeWarmCache = async (id: string, messages: ChatMessage[]) => {
    try { await AsyncStorage.setItem(cacheKey(id), JSON.stringify(messages)); } catch {}
};

// UUID v4 выглядит как xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx — используем это
// чтобы отличить оптимистичные сообщения от серверных (у серверных _id это число)
const isOptimisticId = (id: string | number): boolean =>
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4/.test(id);

// Мёржим серверные сообщения с оптимистичными:
// оставляем оптимистичные у которых нет соответствия на сервере (по тексту + fromMe + время ±10с)
const mergeMessages = (serverMsgs: ChatMessage[], currentMsgs: ChatMessage[]): ChatMessage[] => {
    const optimistic = currentMsgs.filter(m => isOptimisticId(m._id));
    if (optimistic.length === 0) return serverMsgs;

    const unconfirmed = optimistic.filter(opt => {
        const optTime = opt.createdAt instanceof Date
            ? opt.createdAt.getTime()
            : new Date(opt.createdAt).getTime();

        const hasMatch = serverMsgs.some(srv => {
            const srvTime = srv.createdAt instanceof Date
                ? srv.createdAt.getTime()
                : new Date(srv.createdAt).getTime();
            return (
                srv.text === opt.text &&
                srv.fromMe === opt.fromMe &&
                Math.abs(srvTime - optTime) < 10_000
            );
        });
        return !hasMatch;
    });

    if (unconfirmed.length === 0) return serverMsgs;

    return [...serverMsgs, ...unconfirmed].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
};

interface ChatMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    fromMe: boolean;
    senderName?: string;
}

interface ErrorState {
    visible: boolean;
    message: string;
    errorType: 'no_internet' | 'server_down' | 'server_error';
    onRetry?: () => void;
}

const ChatPage = () => {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    

    const { stompClient, isConnected, messages, connectWebSocket, getValidToken } = useWebSocket();
    const { userInfo } = useAppSelector(state => state.user);
    const { userInfoById } = useAppSelector(state => state.profile);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [errorModal, setErrorModal] = useState<ErrorState>({
        visible: false,
        message: '',
        errorType: 'server_error',
    });

    const showError = useCallback((
        message: string,
        errorType: ErrorState['errorType'],
        onRetry?: () => void,
    ) => {
        setErrorModal({ visible: true, message, errorType, onRetry });
    }, []);

    const hideError = useCallback(() => {
        setErrorModal(prev => ({ ...prev, visible: false }));
    }, []);

    const flatListRef = useRef<FlatList>(null);
    const loadedForIdRef = useRef<string | null>(null);
    const connectingRef = useRef(false);
    const isMountedRef = useRef(true);
    const pendingTextRef = useRef<string>('');
    const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    

    const chatMessagesRef = useRef<ChatMessage[]>([]);
    useEffect(() => {
        chatMessagesRef.current = chatMessages;
    }, [chatMessages]);

    const formatMessages = useCallback((content: any[]): ChatMessage[] => {
        return content
            .filter((msg: any) => msg.sender != null)
            .map((msg: any) => ({
                _id: msg.id ?? String(uuid.v4()),
                text: msg.text,
                createdAt: parseDateString(msg.createdAt),
                fromMe: String(msg.sender.id) === String(userInfo?.id),
                senderName: msg.sender.fullName,
            }))
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }, [userInfo?.id]);

    const fetchFromServer = useCallback((chatId: string, showLoader: boolean) => {
    dispatch(getChatMessages({ id: chatId, page: 0, size: 100 }))
        .unwrap()
        .then((data: any) => {
            if (!isMountedRef.current || loadedForIdRef.current !== chatId) return;
            const formatted = data?.content?.length > 0
                ? formatMessages(data.content)
                : [];
            
            setChatMessages(prev => {
                const merged = data?.content?.length > 0
                    ? mergeMessages(formatted, prev)
                    : [];
                HOT_CACHE.set(chatId, merged);
                writeWarmCache(chatId, merged);
                return merged;
            });
        })
        .catch(() => {
            // ✅ При ошибке — не трогаем существующие сообщения
            // если они уже загружены из кэша
        })
        .finally(() => {
            if (!isMountedRef.current) return;
            // ✅ ВСЕГДА сбрасываем лоадер, независимо от showLoader
            setIsLoading(false);
        });
}, [formatMessages, dispatch]);

    useEffect(() => {
        if (!id || !userInfo?.id) return;
        if (loadedForIdRef.current === id) return;
        loadedForIdRef.current = id;

        dispatch(getUserInfoById(id));
        dispatch(readMessages({ id }));

        const loadMessages = async () => {
            const hot = HOT_CACHE.get(id);
            if (hot && hot.length > 0) {
                setChatMessages(hot);
                setIsLoading(false);
                fetchFromServer(id, false);
                return;
            }
            const warm = await readWarmCache(id);
            if (warm && warm.length > 0) {
                if (!isMountedRef.current) return;
                setChatMessages(warm);
                HOT_CACHE.set(id, warm);
                setIsLoading(false);
                fetchFromServer(id, false);
                return;
            }
            setIsLoading(true);
            fetchFromServer(id, true);
        };

        loadMessages();
    }, [id, userInfo?.id]);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: userInfoById?.fullName || t('profile.noName'),
            headerBackTitle: t('common.back'),
        });
    }, [userInfoById]);

    useEffect(() => {
        if (!isConnected && userInfo?.id && !connectingRef.current) {
            connectingRef.current = true;
            connectWebSocket(userInfo.id);
        }
        if (isConnected) {
            connectingRef.current = false;
            if (pendingTextRef.current) {
                setInputText(pendingTextRef.current);
                pendingTextRef.current = '';
            }
        }
    }, [isConnected, userInfo?.id]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && userInfo?.id && !isConnected && !connectingRef.current) {
                connectingRef.current = true;
                connectWebSocket(userInfo.id);
            }
        });
        return () => unsubscribe();
    }, [userInfo?.id, isConnected]);

    useEffect(() => {
        isMountedRef.current = true;
        dispatch(setChatOpen(true));
        return () => {
            isMountedRef.current = false;
            dispatch(setChatOpen(false));
            loadedForIdRef.current = null;
            // Чистим таймер рефетча при анмаунте
            if (refetchTimerRef.current) {
                clearTimeout(refetchTimerRef.current);
                refetchTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!messages?.length) return;
        const latest = messages[messages.length - 1];
        if (String(latest.fromUserId) === String(userInfo?.id)) return;
        if (String(latest.fromUserId) !== String(id)) return;

        const incoming: ChatMessage = {
            _id: `ws-${latest.fromUserId}-${Date.now()}`,
            text: latest.text,
            createdAt: parseDateString(latest.createdAt),
            fromMe: false,
            senderName: userInfoById?.fullName,
        };

        setChatMessages(prev => {
            const isDuplicate = prev.some(msg => {
                const msgTime = msg.createdAt instanceof Date
                    ? msg.createdAt.getTime()
                    : new Date(msg.createdAt).getTime();
                return (
                    msg.text === incoming.text &&
                    !msg.fromMe &&
                    Math.abs(msgTime - incoming.createdAt.getTime()) < 5000
                );
            });
            if (isDuplicate) return prev;
            const updated = [...prev, incoming];
            HOT_CACHE.set(id, updated);
            return updated;
        });

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const onSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
        showError(
            t('chat.noInternetMessage') || 'Нет подключения к интернету. Проверьте Wi-Fi или мобильные данные.',
            'no_internet',
        );
        return;
    }

    const zonedDate = toZonedTime(new Date(), "Asia/Almaty");
    const messageId = String(uuid.v4());
    const newMessage: ChatMessage = {
        _id: messageId,
        text,
        createdAt: zonedDate,
        fromMe: true,
        senderName: userInfo?.fullName,
    };

    // Оптимистично добавляем сообщение
    setChatMessages(prev => {
        const updated = [...prev, newMessage];
        HOT_CACHE.set(id, updated);
        writeWarmCache(id, updated);
        return updated;
    });
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
        await dispatch(sendMessage({
            toUserId: Number(id),
            text,
            fromUserId: userInfo?.id
        })).unwrap();

        console.log('[CHAT] message sent');

        if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
        refetchTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && loadedForIdRef.current === id) {
                fetchFromServer(id, false);
            }
            refetchTimerRef.current = null;
        }, 1500);

    } catch (error) {
        setChatMessages(prev => {
            const updated = prev.filter(m => m._id !== messageId);
            HOT_CACHE.set(id, updated);
            writeWarmCache(id, updated);
            return updated;
        });
        pendingTextRef.current = text;
        setInputText(text);
        showError(
            t('chat.sendErrorMessage') || 'Не удалось отправить сообщение. Проверьте соединение и попробуйте снова.',
            'server_error',
            () => onSend(),
        );
    }
}, [id, userInfo, inputText, showError, fetchFromServer, dispatch]);

    const renderItem = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
        const prevMsg = index > 0 ? chatMessagesRef.current[index - 1] : null;
        const showDateSeparator = !prevMsg || !isSameDay(item.createdAt, prevMsg.createdAt);

        let dateStr = '';
        let timeStr = '';
        try {
            dateStr = format(item.createdAt, 'dd MMMM yyyy', { locale: ru });
            timeStr = format(item.createdAt, 'HH:mm');
        } catch {}

        return (
            <View>
                {showDateSeparator && (
                    <View style={styles.dayContainer}>
                        <View style={styles.dayLine} />
                        <Text style={styles.dayText}>{dateStr}</Text>
                        <View style={styles.dayLine} />
                    </View>
                )}
                <View style={[styles.messageRow, item.fromMe ? styles.messageRowRight : styles.messageRowLeft]}>
                    <View style={[styles.bubble, item.fromMe ? styles.bubbleRight : styles.bubbleLeft]}>
                        <Text style={[styles.messageText, item.fromMe ? styles.messageTextRight : styles.messageTextLeft]}>
                            {item.text}
                        </Text>
                        <Text style={[styles.timeText, item.fromMe ? styles.timeRight : styles.timeLeft]}>
                            {timeStr}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }, []);

    if (!userInfo) return null;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                <View style={styles.listContainer}>
                    {isLoading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#8B9EB0" />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={chatMessages.slice(-50)}
                            keyExtractor={item => String(item._id)}
                            renderItem={renderItem}
                            contentContainerStyle={styles.messagesList}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={5}
                            windowSize={3}
                            initialNumToRender={15}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>{t('chat.noMessages') || 'Нет сообщений'}</Text>
                                </View>
                            }
                        />
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={t('chat.inputPlaceholder') || 'Написать сообщение...'}
                            placeholderTextColor="#AAAAAA"
                            multiline
                            maxLength={2000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
                            onPress={onSend}
                            disabled={!inputText.trim()}
                        >
                            <Text style={[styles.sendArrow, !inputText.trim() && { color: '#C0C0C0' }]}>→</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <ErrorModal
                visible={errorModal.visible}
                message={errorModal.message}
                errorType={errorModal.errorType}
                onClose={hideError}
                onRetry={errorModal.onRetry}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    keyboardView: { flex: 1 },
    listContainer: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messagesList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexGrow: 1 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 15, color: '#999' },
    dayContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    dayLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
    dayText: { fontSize: 12, color: '#999', marginHorizontal: 12 },
    messageRow: { marginBottom: 4, maxWidth: '75%' },
    messageRowRight: { alignSelf: 'flex-end' },
    messageRowLeft: { alignSelf: 'flex-start' },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
    bubbleRight: { backgroundColor: '#8B9EB0', borderBottomRightRadius: 4 },
    bubbleLeft: { backgroundColor: '#EFEFEF', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 22 },
    messageTextRight: { color: '#FFFFFF' },
    messageTextLeft: { color: '#1A1A1A' },
    timeText: { fontSize: 11, marginTop: 2 },
    timeRight: { color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
    timeLeft: { color: '#AAAAAA', textAlign: 'left' },
    inputContainer: { backgroundColor: '#F8F8F8', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 22, borderWidth: 1, borderColor: '#E0E0E0',
        paddingHorizontal: 14, paddingVertical: 6, minHeight: 44,
    },
    textInput: {
        flex: 1, fontSize: 16, color: '#1A1A1A', maxHeight: 120,
        paddingTop: 6, paddingBottom: 6, marginRight: 8, textAlignVertical: 'center',
    },
    sendButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    sendButtonActive: { backgroundColor: '#8B9EB0' },
    sendButtonInactive: { backgroundColor: 'transparent' },
    sendArrow: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
});

export default ChatPage;