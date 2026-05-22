import { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchUserNotification, seenUserNotification } from "@/store/slices/notificationSlice";
import { useFocusEffect } from '@react-navigation/native';
import MemoList from "@/components/MemoList";
import { useTranslation } from 'react-i18next';

const NotificationTab = () => {
    const { t } = useTranslation();
    const { userNotifications } = useAppSelector(state => state.notifications);
    const { userInfo } = useAppSelector(state => state.user);

    const dispatch = useAppDispatch();
    const [seenNotificationIds, setSeenNotificationIds] = useState<number[]>([]);
    const [isTabActive, setIsTabActive] = useState(false);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (!isTabActive) return;

        const newSeenIds: number[] = [];

        viewableItems.forEach((item: any) => {
            if (item.item.isActive && !seenNotificationIds.includes(item.item.id)) {
                newSeenIds.push(item.item.id);
            }
        });

        if (newSeenIds.length > 0) {
            setSeenNotificationIds(prevIds => [...prevIds, ...newSeenIds]);
        }
    }, [seenNotificationIds, isTabActive]);

    useFocusEffect(
        useCallback(() => {
            setIsTabActive(true);
            dispatch(fetchUserNotification(userInfo.id));
            return () => setIsTabActive(false);
        }, [])
    );

    useEffect(() => {
        if (seenNotificationIds.length > 0 && userInfo?.id) {
            dispatch(seenUserNotification({ userId: userInfo.id, notificationIds: seenNotificationIds }))
                .unwrap()
                .then(() => {
                    dispatch(fetchUserNotification(userInfo.id));
                })
                .catch((err: any) => {
                    Alert.alert(
                        t('notifications.errorTitle'),
                        err.message || t('notifications.errorMessage'),
                        [{ text: t('notifications.errorButton'), onPress: () => console.log("Ошибка при обновлении уведомлений") }]
                    );
                });
        }
    }, [seenNotificationIds, userInfo]);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    return (
        <FlatList
            data={userNotifications}
            renderItem={({ item }: any) => (
                <MemoList notification={item} />
            )}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={styles.container}
            style={styles.list}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            removeClippedSubviews
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    list: {
        backgroundColor: '#F5F5F5',
    },
    container: {
        backgroundColor: '#F5F5F5',
        marginTop: 30,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default NotificationTab;