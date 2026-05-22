import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from "@/store/hooks";
import { getMyChats } from "@/store/slices/chatSlice";
import * as React from 'react';

type MessagesType = { fromUserId: string; text: string; toUserId: string; createdAt?: string };

interface WebSocketContextProps {
    isConnected: boolean;
    stompClient: null;
    connectWebSocket: (userId: number) => void;
    disconnectWebSocket: () => void;
    messages: MessagesType[];
    getValidToken: () => Promise<string | null>;
}

const WebSocketContext = createContext<WebSocketContextProps>({
    isConnected: false,
    stompClient: null,
    connectWebSocket: () => {},
    disconnectWebSocket: () => {},
    messages: [],
    getValidToken: async () => null,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages] = useState<MessagesType[]>([]);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dispatch = useAppDispatch();

    const getValidToken = useCallback(async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem('accessToken');
        } catch {
            return null;
        }
    }, []);

    const connectWebSocket = useCallback((userId: number) => {
        if (pollingRef.current) return;

        setIsConnected(true);

        pollingRef.current = setInterval(async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');

                // Нет токена — останавливаем polling (пользователь вышел)
                if (!token) {
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                    setIsConnected(false);
                    return;
                }

                // getMyChats помечен _silent: true — interceptor при 401 просто
                // вернёт rejectWithValue без refresh и без logout.
                // Нам здесь ничего делать не нужно — слайс обновит state сам.
                await dispatch(getMyChats());

            } catch {
                // Сетевая ошибка — просто пропускаем итерацию, polling продолжается
            }
        }, 5000);
    }, [dispatch]);

    const disconnectWebSocket = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const contextValue = useMemo(() => ({
        isConnected,
        stompClient: null,
        messages,
        connectWebSocket,
        disconnectWebSocket,
        getValidToken,
    }), [isConnected, messages, connectWebSocket, disconnectWebSocket, getValidToken]);

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);