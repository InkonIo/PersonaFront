import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {instance} from "@/store/api";

export const sendFeedback = createAsyncThunk(
    'send/feedback',
    async (params: { message: string, title: string }, { rejectWithValue }) => {
        try {
            const response = await instance.post(`api/requests`, {
                message: params.message,
                title: params.title,
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || 'Произошла ошибка');
        }
    }
);

const initialState: any = {
    loading: false,
    rating: null
}

const requestSlice = createSlice({
    name: 'request',
    initialState,
    reducers: { },
    extraReducers: (builder) =>
        builder
            .addCase(sendFeedback.pending, state => {
                state.loading = true;
            })
            .addCase(sendFeedback.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sendFeedback.rejected, (state) => {
                state.loading = false;
            })
})

export default requestSlice.reducer