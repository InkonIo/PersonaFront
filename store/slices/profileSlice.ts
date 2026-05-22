import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {instance} from "@/store/api";


export const getProfiles = createAsyncThunk(
    'get/profiles',
    async (params: any, { rejectWithValue }) => {
        try {
            const { sortBy, page, size, ...restParams } = params;


            const response = await instance.post(
                `api/docs/profile/filter?page=${page}&size=${size}&sort=${sortBy}`,
                restParams,
            );

            return response.data;
        } catch (err: any) {
            console.error('[getProfiles] ERROR:', err.response?.status, JSON.stringify(err.response?.data));
            return rejectWithValue(err.response?.data ?? { message: 'Network error' });
        }
    }
);

// profileSlice.ts
export const getUserInfoById = createAsyncThunk(
    'get/user/info/by/id',
    async (id: string | number, { rejectWithValue }) => {
        try {
            console.log('[getUserInfoById] запрос для id:', id);
            const response = await instance.get(`api/docs/profile/${id}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data ?? { message: 'Network error' });
        }
    }
);

export interface HomeState {
    profiles: any;
    loading: boolean;
    userInfoById: any;
}

const initialState: HomeState = {
    profiles: [],
    loading: false,
    userInfoById: null,
}



const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfiles: (state) => {
            state.profiles = null;
        },
        clearUserInfoById: (state) => {   // ← сюда
            state.userInfoById = null;
        },
        replaceProfiles: (state, { payload }) => {
            state.profiles = payload;  // ← атомарная замена без мигания
        },
        // Оптимистичное обновление рейтинга — сразу в сторе, без ожидания бэкенда
        updateUserRatingOptimistic: (state, { payload }: { payload: { userId: number | string, newRating: number, newCount: number } }) => {
            const { userId, newRating, newCount } = payload;
            // Обновляем userInfoById
            if (state.userInfoById?.id == userId) {
                state.userInfoById = {
                    ...state.userInfoById,
                    rating: newRating,
                    ratingCount: newCount,
                };
            }
            // Обновляем карточку в списке на home
            if (state.profiles?.content) {
                state.profiles = {
                    ...state.profiles,
                    content: state.profiles.content.map((p: any) =>
                        p.id == userId ? { ...p, rating: newRating, ratingCount: newCount } : p
                    ),
                };
            }
        },
        updateStatusOptimistic: (state, { payload }: { payload: { userId: number | string, status: any } }) => {
    if (state.userInfoById?.id == payload.userId) {
        state.userInfoById = { ...state.userInfoById, status: payload.status };
    }
    if (state.profiles?.content) {
        state.profiles = {
            ...state.profiles,
            content: state.profiles.content.map((p: any) =>
                p.id == payload.userId ? { ...p, status: payload.status } : p
            ),
        };
    }
},
    },
    extraReducers: (builder) =>
        builder
            .addCase(getProfiles.pending, state => {
                state.loading = true;
            })
            .addCase(getProfiles.fulfilled, (state, { payload }) => {
                if (payload.pageable?.pageNumber === 0) {
                    state.profiles = payload;
                } else {
                    const newProfiles = payload.content.filter(
                        (newProfile: any) => !state.profiles.content.some((existingProfile: any) => existingProfile.id === newProfile.id)
                    );
                    state.profiles = {
                        ...payload,
                        content: [...state.profiles.content, ...newProfiles],
                    };
                }
                state.loading = false;
            })
            .addCase(getProfiles.rejected, (state) => {
                state.loading = false;
            })
            .addCase(getUserInfoById.pending, state => {
                state.loading = true;
                state.userInfoById = null;
            })
            .addCase(getUserInfoById.fulfilled, (state, {payload}) => {
                state.userInfoById = payload
                state.loading = false;
            })
            .addCase(getUserInfoById.rejected, (state) => {
                state.loading = false;
            })
})



export const { clearProfiles, clearUserInfoById, replaceProfiles, updateUserRatingOptimistic, updateStatusOptimistic } = profileSlice.actions;
export default profileSlice.reducer