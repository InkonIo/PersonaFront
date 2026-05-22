import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar, Animated, Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Colors from '@/constants/Colors';
import CustomTabBarButton from "@/app/CustomTabBarButton";
import NotificationTab from "@/components/NotificationTab";
import ChatTab from "@/components/ChatTab";
import { useTranslation } from 'react-i18next';
import { setOfflineStatusListener, isOffline } from '@/store/api';

const Tab = createMaterialTopTabNavigator();

// ─── Простой тост ─────────────────────────────────────────────────────────────
const Toast = ({ visible, message }: { visible: boolean; message: string }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.delay(2000),
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    return (
        <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

const NotificationTabs = () => {
    const { t } = useTranslation();
    const [offline, setOffline] = useState(isOffline());
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigationRef = useRef<any>(null);

    useEffect(() => {
        setOfflineStatusListener((status) => {
            setOffline(status);

            // ─── Инет пропал — сразу кидаем на уведомления ───────────────────
            if (status && navigationRef.current) {
                navigationRef.current.navigate('FirstTab');
            }
        });
    }, []);

    const showToast = () => {
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        setToastVisible(true);
        toastTimeout.current = setTimeout(() => setToastVisible(false), 2600);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: Colors.white,
                    tabBarInactiveTintColor: Colors.text,
                    tabBarStyle: { backgroundColor: 'transparent', elevation: 0 },
                    tabBarIndicatorStyle: { backgroundColor: 'transparent' },
                }}
                tabBar={({ state, descriptors, navigation }: any) => {
                    // ─── Сохраняем ref на navigation чтобы использовать в листенере
                    navigationRef.current = navigation;

                    return (
                        <View style={styles.tabBar}>
                            {state.routes.map((route: any, index: any) => {
                                const { options } = descriptors[route.key];
                                const label =
                                    options.tabBarLabel !== undefined
                                        ? options.tabBarLabel
                                        : options.title !== undefined
                                            ? options.title
                                            : route.name;

                                const isFocused = state.index === index;
                                const isChatTab = route.name === 'SecondTab';
                                const isDisabled = isChatTab && offline;

                                const onPress = () => {
                                    if (isDisabled) {
                                        showToast();
                                        return;
                                    }

                                    const event = navigation.emit({
                                        type: 'tabPress',
                                        target: route.key,
                                        canPreventDefault: true,
                                    });

                                    if (!isFocused && !event.defaultPrevented) {
                                        navigation.navigate(route.name, route.params);
                                    }
                                };

                                return (
                                    <CustomTabBarButton
                                        key={route.key}
                                        onPress={onPress}
                                        accessibilityState={{ selected: isFocused }}
                                        disabled={isDisabled}
                                    >
                                        {label}
                                    </CustomTabBarButton>
                                );
                            })}
                        </View>
                    );
                }}
            >
                <Tab.Screen name="FirstTab" component={NotificationTab} options={{ tabBarLabel: t('tabs.notifications') }} />
                <Tab.Screen name="SecondTab" component={ChatTab} options={{ tabBarLabel: t('tabs.chats') }} />
            </Tab.Navigator>

            <Toast visible={toastVisible} message="Нет интернета. Чаты недоступны." />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 10,
    },
    toast: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    toastText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default NotificationTabs;