import {AsyncThunk, configureStore} from '@reduxjs/toolkit'
import homeSlice from "@/store/slices/homeSlice";
import dictionarySlice from "@/store/slices/dictionarySlice";
import profileSlice from "@/store/slices/profileSlice";
import usersSlice from "@/store/slices/usersSlice";
import ratingsSlice from "@/store/slices/ratingsSlice";
import imageSlice from "@/store/slices/imageSlice";
import notificationSlice from "@/store/slices/notificationSlice";
import requestSlice from "@/store/slices/requestSlice";
import chatSlice from "@/store/slices/chatSlice";
import authSlice from "@/store/slices/authSlice";
import paymentReducer from '@/store/slices/paymentSlice';

export const store = configureStore({
    reducer: {
        user: usersSlice,
        home: homeSlice,
        dictionary: dictionarySlice,
        profile: profileSlice,
        rating: ratingsSlice,
        image: imageSlice,
        notifications: notificationSlice,
        request: requestSlice,
        chat: chatSlice,
        auth: authSlice,
        payment: paymentReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false
    })
})

type ThunkApiConfig = {
    state: RootState
    dispatch: AppDispatch
    rejectValue: unknown
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export type AppThunk<Returned = void, ThunkArg = void> = AsyncThunk<
    Returned,
    ThunkArg,
    ThunkApiConfig
>
