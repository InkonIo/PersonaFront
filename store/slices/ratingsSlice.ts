import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { instance } from "@/store/api";


export const getRating = createAsyncThunk(
    'get/rating',
    async (id: string | number, { rejectWithValue }) => {
        try {
            const response = await instance.get(`api/ratings/${id}`)
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const setRating = createAsyncThunk(
    'set/rating',
    async (params: { id: string | number, value: number }, { rejectWithValue }) => {
        try {
            console.log('[setRating] отправляем оценку:', JSON.stringify(params));
            const response = await instance.post(`api/ratings`, {
                toUser: params.id,
                value: params.value
            })
            console.log('[setRating] ответ статус:', response.status);
            console.log('[setRating] ответ data:', JSON.stringify(response.data));
            return response.data;
        } catch (err: any) {
            console.log('[setRating] ОШИБКА статус:', err.response?.status);
            console.log('[setRating] ОШИБКА data:', JSON.stringify(err.response?.data));
            return rejectWithValue(err.response?.data ?? err.message);
        }
    }
);

export const checkForRating = createAsyncThunk(
    'check/for/rating',
    async (params: { id: string | number }, { rejectWithValue }) => {
        try {
            console.log('[checkForRating] запрос для userId:', params.id);
            const response = await instance.post(`api/ratings/user-check`, {
                toUserId: params.id,
            })
            console.log('[checkForRating] ответ статус:', response.status);
            console.log('[checkForRating] ответ data:', JSON.stringify(response.data));
            return response.data;
        } catch (err: any) {
            console.log('[checkForRating] ОШИБКА статус:', err.response?.status);
            console.log('[checkForRating] ОШИБКА data:', JSON.stringify(err.response?.data));
            return rejectWithValue(err.response?.data ?? err.message);
        }
    }
);


const initialState: any = {
    loading: false,
    rating: null,
    isRatingSetted: null,
}

const ratingsSlice = createSlice({
    name: 'rating',
    initialState,
    reducers: {},
    extraReducers: (builder) =>
        builder
            .addCase(getRating.pending, state => {
                state.loading = true;
            })
            .addCase(getRating.fulfilled, (state, { payload }) => {
                state.rating = payload
                state.loading = false;
            })
            .addCase(getRating.rejected, (state) => {
                state.loading = false;
            })
            .addCase(setRating.pending, state => {
                state.loading = true;
            })
            .addCase(setRating.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(setRating.rejected, (state) => {
                state.loading = false;
            })
            .addCase(checkForRating.pending, state => {
                state.loading = true;
            })
            .addCase(checkForRating.fulfilled, (state, { payload }) => {
                console.log('[ratingsSlice] checkForRating fulfilled, payload:', JSON.stringify(payload));
                state.isRatingSetted = payload
                state.loading = false;
            })
            .addCase(checkForRating.rejected, (state, { payload }) => {
                console.log('[ratingsSlice] checkForRating rejected, payload:', JSON.stringify(payload));
                state.isRatingSetted = null
                state.loading = false;
            })
})

export default ratingsSlice.reducer