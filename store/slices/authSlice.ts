import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetFormData, resetUserInfo, setImageUrl } from "@/store/slices/usersSlice";
import { resetHomeState } from './homeSlice';

interface AuthState {
    isAuthenticated: boolean;
    isInitialized: boolean;
    isLoggingOut: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isInitialized: false,
    isLoggingOut: false,
};

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        console.log('🚨 [logout] ВЫЗВАН!');
        console.trace();
        await AsyncStorage.setItem('userInitiatedLogout', 'true');
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('bioAccessToken');
        await AsyncStorage.removeItem('bioRefreshToken');
        dispatch(setAuth(false));
        dispatch(resetUserInfo());
        dispatch(resetFormData());
        dispatch(setImageUrl(""));
        dispatch(resetHomeState());
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setInitialized: (state, action) => {
            state.isInitialized = action.payload;
        },
        setLoggingOut: (state, action) => {
            state.isLoggingOut = action.payload;
        },
    },
});

export const { setAuth, setInitialized, setLoggingOut } = authSlice.actions;
export default authSlice.reducer;