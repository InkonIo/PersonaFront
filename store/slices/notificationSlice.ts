import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {instance} from "@/store/api";

interface Notification {
    id: number;
    title: string;
    description: string;
    data: string;
    isActive: boolean;
    createdAt: string;
}

interface NotificationsState {
    userNotifications: Notification[];
    loading: boolean;
    isChatOpen: boolean;
}

export const fetchUserNotification = createAsyncThunk(
    'fetch/user/notification',
    async (userId: number, { rejectWithValue }) => {
        try {
            const response = await instance.get(`api/notifications/user/${userId}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const seenUserNotification = createAsyncThunk(
    'seen/user/notification',
    async (params: { userId: string | number, notificationIds: number[] }, { rejectWithValue }) => {
        try {
            const response = await instance.post(`api/notifications/seen`, {
                userId: params.userId,
                notificationIds: params.notificationIds
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

const initialState: NotificationsState = {
    userNotifications: [],
    loading: false,
    isChatOpen: false
}

const notificationsSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {
        setChatOpen: (state, action) => {
            state.isChatOpen = action.payload;
        }
    },
    extraReducers: (builder) =>
        builder
            .addCase(fetchUserNotification.pending, state => {
                state.loading = true;
            })
            .addCase(fetchUserNotification.fulfilled, (state, { payload }) => {
                state.userNotifications = payload
                state.loading = false;
            })
            .addCase(fetchUserNotification.rejected, (state) => {
                state.loading = false;
            })
            .addCase(seenUserNotification.pending, state => {
                state.loading = true;
            })
            .addCase(seenUserNotification.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(seenUserNotification.rejected, (state) => {
                state.loading = false;
            })
})

export const { setChatOpen } = notificationsSlice.actions;

export default notificationsSlice.reducer