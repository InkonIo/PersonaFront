import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {ChatsType, ListMessageType} from "@/store/types";
import {chatInstance} from "@/store/api";


export const getMyChats = createAsyncThunk(
    'get/my/chats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await chatInstance.get(`chats/my`, { _silent: true } as any);
            return response.data;
        } catch (err: any) {
            return rejectWithValue({ status: err.response?.status, data: err.response?.data });
        }
    }
);

export const sendMessage = createAsyncThunk<any, { toUserId: number; text: string; fromUserId: number }>(
    'send/message',
    async (params, { rejectWithValue }) => {
        try {
            const response = await chatInstance.post(
                `chats/users/${params.toUserId}/messages`,
                params,
                { _silent: true } as any
            );
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const deleteChat = createAsyncThunk(
    'chat/deleteChat',
    async (chatId: string) => {
        await chatInstance.delete(`chats/${chatId}`);
        return chatId;
    }
);

export const getChatMessages = createAsyncThunk<any, { id: string; page: number; size: number }>(
    'get/chat/messages',
    async (params, { rejectWithValue }) => {
        try {
            const response = await chatInstance.get(
                `chats/users/${params.id}/messages?page=${params.page}&size=${params.size}`,
                { _silent: true } as any
            );
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const prefetchChatMessages = createAsyncThunk<any, string>(
    'prefetch/chat/messages',
    async (userId, { getState, rejectWithValue }) => {
        const state = getState() as any;
        if (state.chat.prefetchedMessages[userId]) return null;
        try {
            const response = await chatInstance.get(
                `chats/users/${userId}/messages?page=0&size=100`,
                { _silent: true } as any
            );
            return { userId, data: response.data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const readMessages = createAsyncThunk<any, { id: string }>(
    'read/messages',
    async (params, thunkAPI) => {
        try {
            const response = await chatInstance.post(
                `chats/users/${params.id}/read`,
                undefined,
                { _silent: true } as any
            );
            thunkAPI.dispatch(getMyChats());
            return response.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data);
        }
    }
);

type InitialStateType = {
    loading: boolean
    chats: ChatsType[]
    listMessages: ListMessageType
    prefetchedMessages: Record<string, ListMessageType>
}

const initialState: InitialStateType = {
    loading: false,
    chats: [],
    listMessages: {} as ListMessageType,
    prefetchedMessages: {},
}

const chatSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.listMessages = {} as ListMessageType;
        },
        receivedNewMessage: (state, { payload }) => {
            const chatIndex = state.chats.findIndex(c =>
                c.user?.id === payload.fromUserId || c.user?.id === payload.toUserId
            );

            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = {
                    id: 0,
                    text: payload.text,
                    createdAt: payload.createdAt ?? new Date().toISOString(),
                    sender: state.chats[chatIndex].user as any,
                    receiver: state.chats[chatIndex].user as any,
                };
                const [updatedChat] = state.chats.splice(chatIndex, 1);
                state.chats.unshift(updatedChat);
            }

            if (state.listMessages.content) {
                const exists = state.listMessages.content.some((m: any) => m.id === payload.id);
                if (!exists) {
                    state.listMessages.content.unshift(payload);
                }
            }
        }
    },

    extraReducers: (builder) =>
        builder
            .addCase(getMyChats.pending, () => {})
            .addCase(getMyChats.rejected, () => {})
            .addCase(getChatMessages.pending, state => {
                state.loading = true;
            })
            .addCase(getChatMessages.fulfilled, (state, { payload }) => {
                state.listMessages = payload;
                state.loading = false;
            })
            .addCase(getChatMessages.rejected, state => {
                state.loading = false;
            })
            .addCase(prefetchChatMessages.fulfilled, (state, { payload }) => {
                if (payload) {
                    state.prefetchedMessages[payload.userId] = payload.data;
                }
            })
            .addCase(readMessages.pending, state => {
                state.loading = true;
            })
            .addCase(readMessages.fulfilled, state => {
                state.loading = false;
            })
            .addCase(readMessages.rejected, state => {
                state.loading = false;
            })
            .addCase(sendMessage.pending, () => {})
            .addCase(sendMessage.fulfilled, () => {})
            .addCase(sendMessage.rejected, () => {})
            .addCase(deleteChat.fulfilled, (state, action) => {
                state.chats = state.chats.filter(c => String(c.id) !== action.payload);
            })
            .addCase(getMyChats.fulfilled, (state, { payload }) => {
                state.chats = payload.filter((chat: any) => chat.user !== null);
            })
})

export const { receivedNewMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;