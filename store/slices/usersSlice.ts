import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {instance} from "@/store/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {MentorRequestsStatuses} from "@/enum";

export const createNewUser = createAsyncThunk(
    'create/new/user',
    async (params: any, {rejectWithValue}) => {
        try {
            const response = await instance.post(`public/users/create`, params);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const editUser = createAsyncThunk(
    'edit/user',
    async (params: any, {rejectWithValue}) => {
        try {
            const response = await instance.patch(`api/users`, params);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const loginUser = createAsyncThunk(
    'login/user',
    async (params: any, {rejectWithValue}) => {
        try {
            const response = await instance.post(`public/users/login`, params);
            const {accessToken, refreshToken} = response.data;
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const getUserInfo = createAsyncThunk(
    'get/user/info',
    async (_, {rejectWithValue}) => {
        try {
            const response = await instance.get(`api/users/me`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data ?? { status: err.response?.status });
        }
    }
);

export const subscribeToUser = createAsyncThunk(
    'subscript/to/user',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/subscribe`, { toUser: id });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const unSubscribeUser = createAsyncThunk(
    'unSubscribe/user',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/unsubscribe`, { toUser: id });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const checkIfUserAlreadySubscribe = createAsyncThunk(
    'check/user/already/subscribe',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/check-subscription`, { userId: id });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const requestToMentorForMentorship = createAsyncThunk(
    'request/to/mentor/for/mentorship',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/request-mentor`, { userId: id });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const cancelRequestToMentorForMentorship = createAsyncThunk(
    'cancel/request/to/mentor/for/mentorship',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/cancel-request-mentor`, { userId: id });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const checkRequestToMentorForMentorship = createAsyncThunk(
    'check/request/to/mentor/for/mentorship',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/check-request-mentor`, { userId: id });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const changeUserVisible = createAsyncThunk(
    'change/user/visible',
    async (_, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/visible`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const registerUserToken = createAsyncThunk(
    'register/user/token',
    async (exponentPushToken: string, {rejectWithValue}) => {
        try {
            const response = await instance.post(`api/users/register-token`, { token: exponentPushToken });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const deleteCurrentUser = createAsyncThunk(
    'delete/current/user',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.delete(`api/users/me`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    'update/user/status',
    async (statusId: number, { rejectWithValue }) => {
        try {
            const response = await instance.patch('api/users/status', { statusId });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data ?? { message: 'Network error' });
        }
    }
);

const initialState: any = {
    formData: {
        login: '',
        fullName: '',
        dateOfBirth: '',
        password: '',
        city: null,
        country: null,
        fieldOfWork: null,
        professions: null,
        status: null,
        email: "",
        linksToSocial: "",
        maritalStatuses: null,
        educationAndCourses: "",
        experienceAndSkills: "",
        minDesiredIncome: '',
        maxDesiredIncome: '',
        dreamWork: "",
        hobby: "",
    },
    imageUrl: "",
    imageUrlForBackend: "",
    loading: false,
    credentials: null,
    userInfo: null,
    isSubscribeToProfile: false,
    requestStatus: MentorRequestsStatuses.NOT_REQUESTED,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateFormData: (state, action: PayloadAction<{ name: string, value: any }>) => {
            const {name, value} = action.payload;
            state.formData[name] = value;
        },
        resetFormData: (state) => {
            state.formData = {
                login: '',
                fullName: '',
                dateOfBirth: '',
                password: '',
                city: {},
                country: {},
                fieldOfWork: null,
                professions: null,
                status: null,
                email: "",
                linksToSocial: "",
                maritalStatuses: null,
                educationAndCourses: "",
                experienceAndSkills: "",
                minDesiredIncome: "",
                maxDesiredIncome: "",
                dreamWork: "",
                hobby: "",
            }
            state.imageUrl = "";
            state.imageUrlForBackend = "";
        },
        resetUserInfo: (state) => {
            state.userInfo = null;
        },
        setImageUrl: (state, action: PayloadAction<string>) => {
            state.imageUrl = action.payload;
        },
        setImageUrlForBackend: (state, action: PayloadAction<string>) => {
            state.imageUrlForBackend = action.payload;
        },
        setIsSubscribeToProfile: (state, action: PayloadAction<boolean>) => {
            state.isSubscribeToProfile = action.payload;
        },
        setRequestStatus: (state, action: PayloadAction<MentorRequestsStatuses>) => {
            state.requestStatus = action.payload;
        },
        updateStatusOptimistic: (state, action: PayloadAction<{ status: any }>) => {
            if (state.userInfo) {
                state.userInfo = { ...state.userInfo, status: action.payload.status };
            }
        },
        setUserInfo: (state, action: PayloadAction<any>) => {
            state.userInfo = action.payload;
        },
        updateUserInfoOptimistic: (state, action: PayloadAction<Partial<any>>) => {
            if (state.userInfo) {
                state.userInfo = { ...state.userInfo, ...action.payload };
            }
        },
    },
    extraReducers: (builder) =>
        builder
            .addCase(createNewUser.pending, state => { state.loading = true; })
            .addCase(createNewUser.fulfilled, state => { state.loading = false; })
            .addCase(createNewUser.rejected, state => { state.loading = false; })

            .addCase(loginUser.pending, state => { state.loading = true; })
            .addCase(loginUser.fulfilled, (state, {payload}) => {
                state.credentials = payload;
                state.loading = false;
            })
            .addCase(loginUser.rejected, state => { state.loading = false; })

            .addCase(getUserInfo.pending, state => { state.loading = true; })
            .addCase(getUserInfo.fulfilled, (state, {payload}) => {
                state.userInfo = payload;
                state.loading = false;
            })
            .addCase(getUserInfo.rejected, state => {
                // ← userInfo НЕ обнуляем — данные остаются на экране
                state.loading = false;
            })

            .addCase(subscribeToUser.pending, state => { state.loading = true; })
            .addCase(subscribeToUser.fulfilled, state => { state.loading = false; })
            .addCase(subscribeToUser.rejected, state => { state.loading = false; })

            .addCase(unSubscribeUser.pending, state => { state.loading = true; })
            .addCase(unSubscribeUser.fulfilled, state => { state.loading = false; })
            .addCase(unSubscribeUser.rejected, state => { state.loading = false; })

            .addCase(checkIfUserAlreadySubscribe.pending, state => { state.loading = true; })
            .addCase(checkIfUserAlreadySubscribe.fulfilled, state => { state.loading = false; })
            .addCase(checkIfUserAlreadySubscribe.rejected, state => { state.loading = false; })

            .addCase(requestToMentorForMentorship.pending, state => { state.loading = true; })
            .addCase(requestToMentorForMentorship.fulfilled, state => { state.loading = false; })
            .addCase(requestToMentorForMentorship.rejected, state => { state.loading = false; })

            .addCase(cancelRequestToMentorForMentorship.pending, state => { state.loading = true; })
            .addCase(cancelRequestToMentorForMentorship.fulfilled, state => { state.loading = false; })
            .addCase(cancelRequestToMentorForMentorship.rejected, state => { state.loading = false; })

            .addCase(checkRequestToMentorForMentorship.pending, state => { state.loading = true; })
            .addCase(checkRequestToMentorForMentorship.fulfilled, (state, {payload}) => {
                state.requestStatus = payload.status;
                state.loading = false;
            })
            .addCase(checkRequestToMentorForMentorship.rejected, state => { state.loading = false; })

            .addCase(changeUserVisible.pending, state => { state.loading = true; })
            .addCase(changeUserVisible.fulfilled, (state, {payload}) => {
    state.loading = false;
    // Сервер возвращает { message: "..." }, не юзера
    // Просто переключаем visible локально
    if (state.userInfo) {
        state.userInfo = { ...state.userInfo, visible: !state.userInfo.visible };
    }
})
            .addCase(changeUserVisible.rejected, state => { state.loading = false; })

            .addCase(editUser.pending, state => { state.loading = true; })
            .addCase(editUser.fulfilled, state => { state.loading = false; })
            .addCase(editUser.rejected, state => { state.loading = false; })

            .addCase(registerUserToken.pending, state => { state.loading = true; })
            .addCase(registerUserToken.fulfilled, state => { state.loading = false; })
            .addCase(registerUserToken.rejected, state => { state.loading = false; })

            .addCase(deleteCurrentUser.pending, state => { state.loading = true; })
            .addCase(deleteCurrentUser.fulfilled, state => {
                state.loading = false;
                state.userInfo = null;
            })
            .addCase(deleteCurrentUser.rejected, state => { state.loading = false; })
});

export const {
    updateFormData, setRequestStatus, setImageUrl, setIsSubscribeToProfile,
    setImageUrlForBackend, resetFormData, resetUserInfo, updateStatusOptimistic,
    setUserInfo, updateUserInfoOptimistic
} = userSlice.actions;

export default userSlice.reducer;