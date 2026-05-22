import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert, Animated, FlatList, Pressable, RefreshControl,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useWebSocket } from "@/app/WebSocketContext";
import { Image } from "expo-image";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { Link, router, useFocusEffect } from "expo-router";
import { deleteChat, getMyChats, prefetchChatMessages } from "@/store/slices/chatSlice";
import { addHours, format, isValid, parse } from "date-fns";
import { useTranslation } from 'react-i18next';

const ChatItem = React.memo(({ chat, onDelete }: { chat: any; onDelete: (id: number) => void }) => {
    const { t } = useTranslation();
    const translateX = useRef(new Animated.Value(0)).current;
    const [swiped, setSwiped] = useState(false);

    let formattedTime = '';
try {
    const raw = chat.lastMessage?.createdAt;
    if (raw) {
        const parsed = parse(raw, 'dd-MM-yyyy HH:mm:ss', new Date());
        formattedTime = isValid(parsed) ? format(addHours(parsed, 5), 'HH:mm') : '';
    }
} catch { formattedTime = ''; }

    const isGhost = !chat.user;

    const handleSwipe = () => {
        if (swiped) {
            // возврат
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
            setSwiped(false);
        } else {
            // свайп влево — показать кнопку удаления
            Animated.spring(translateX, { toValue: -80, useNativeDriver: true }).start();
            setSwiped(true);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            t('chat.deleteTitle', 'Удалить чат?'),
            t('chat.deleteMessage', 'Это действие нельзя отменить'),
            [
                { text: t('common.cancel', 'Отмена'), style: 'cancel', onPress: () => {
                    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                    setSwiped(false);
                }},
                { text: t('common.delete', 'Удалить'), style: 'destructive', onPress: () => onDelete(chat.id) }
            ]
        );
    };

    return (
        <View style={{ overflow: 'hidden' }}>
            {/* Кнопка удаления — показываем только при свайпе */}
        {swiped && (
            <View style={styles.deleteButton}>
                <TouchableOpacity onPress={confirmDelete} style={styles.deleteButtonInner}>
                    <Text style={styles.deleteButtonText}>🗑</Text>
                </TouchableOpacity>
            </View>
        )}

            <Animated.View style={{ transform: [{ translateX }] }}>
            <Pressable
                onLongPress={handleSwipe}
                onPress={() => {
                    if (swiped) {
                        // закрыть свайп при тапе
                        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                        setSwiped(false);
                        return;
                    }
                    if (isGhost) return;
                    router.push(`/chat/${chat?.user?.id}`);
                }}
            >
                {/* остальной контент без вложенного Pressable */}
                <View style={styles.content}>
                    {chat.user?.imageUrl && chat.user.imageUrl.trim() !== ''
                        ? <Image source={{ uri: chat.user.imageUrl }} style={styles.image} />
                        : (
                            <View style={styles.avatarPlaceholder}>
                                <View style={styles.avatarHead} />
                                <View style={styles.avatarBody} />
                            </View>
                        )
                    }
                    <View style={styles.textContent}>
                        <Text style={[textStyles.body20Medium, { color: isGhost ? '#aaa' : Colors.text }]}>
                            {chat.user?.fullName ?? t('chat.deletedUser', 'Удалённый пользователь')}
                        </Text>
                        <Text numberOfLines={1} style={[textStyles.body12Light, { color: Colors.text, marginTop: 8 }]}>
                            {chat.lastMessage?.text ?? ''}
                        </Text>
                    </View>
                    <View style={styles.time}>
                        <Text style={[textStyles.body12Light, { color: Colors.text }]}>
                            {formattedTime}
                        </Text>
                        {chat?.unreadCount >= 1 && (
                            <View style={styles.unreadMessage}>
                                <Text style={[textStyles.body12Light, { color: Colors.white, textAlign: "center" }]}>
                                    {String(chat.unreadCount)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
        </View>
    );
});

const ChatTab: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { chats } = useAppSelector(state => state.chat);
    const { messages } = useWebSocket();
    const [refreshing, setRefreshing] = useState(false);
    const prefetchedRef = useRef(false);
    const [searchQuery, setSearchQuery] = useState('');

    // ✅ Фикс: prefetch только один раз и только для живых чатов
    useEffect(() => {
        if (chats?.length > 0 && !prefetchedRef.current) {
            prefetchedRef.current = true;
            chats.forEach(chat => {
                try {
                    if (chat?.user?.id) {
                        dispatch(prefetchChatMessages(String(chat.user.id)));
                    }
                } catch (e) {
                    console.warn('[ChatTab] prefetch failed', chat?.user?.id, e);
                }
            });
        }
    }, [chats]);

    useFocusEffect(
        useCallback(() => {
            dispatch(getMyChats()).unwrap().then((data) => {
    data.forEach((chat: any, i: number) => {
        console.log(`CHAT[${i}]:`, JSON.stringify(chat, null, 2));
    });
});
        }, [])
    );

    useEffect(() => {
        if (messages?.length) {
            dispatch(getMyChats());
        }
    }, [messages]);

    const handleDeleteChat = useCallback(async (chatId: number) => {
        await dispatch(deleteChat(String(chatId)));
        dispatch(getMyChats());
    }, [dispatch]);

    const filteredChats = searchQuery.trim()
        ? chats.filter(chat =>
            chat.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : chats;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(getMyChats());
        setRefreshing(false);
    }, []);

    const renderItem = useCallback(({ item: chat }: { item: any }) => (
        <ChatItem chat={chat} onDelete={handleDeleteChat} />
    ), [handleDeleteChat]);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <TextInput
                style={styles.searchInput}
                placeholder={t('chat.search')}
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
            />
            <FlatList
                data={filteredChats}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListEmptyComponent={
                    <ScrollView contentContainerStyle={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('chat.noMessages')}</Text>
                    </ScrollView>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: "#fff",
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        width: '100%',
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    unSeenMessage: {
        backgroundColor: '#F5F5F5',
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
    },
    textContent: {
        flex: 1,
        justifyContent: "center",
    },
    time: {
        alignItems: "center",
        justifyContent: "center",
    },
    unreadMessage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        marginTop: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 80,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    deleteButtonText: {
        fontSize: 22,
    },
    avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#D0D0D0',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    },
    avatarHead: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#A0A0A0',
        marginBottom: 4,
    },
    avatarBody: {
        width: 36,
        height: 24,
        borderRadius: 18,
        backgroundColor: '#A0A0A0',
        marginBottom: -6,
    },
    searchInput: {
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    fontSize: 15,
    color: '#1a1a1a',
},
    });

export default ChatTab;