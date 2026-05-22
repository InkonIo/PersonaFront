import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Мок использует i18n ключи — перевод происходит в компоненте через t()
export const getPaymentHistory = createAsyncThunk(
    'payment/history',
    async (_, { rejectWithValue }) => {
        try {
            // Когда бэк будет готов — раскомментировать:
            // const response = await instance.get('api/payments/history');
            // return response.data;

            // Мок — ключи для перевода, не хардкод текст
            return [
                {
                    id: '1',
                    titleKey: 'rateAccess.accessUntil',
                    descriptionKey: 'rateAccess.paymentPerYear',
                    date: '23.04.2024',
                    amount: '10$',
                },
            ];
        } catch (err: any) {
            return rejectWithValue(err.response?.data ?? err.message);
        }
    }
);

export const createPayment = createAsyncThunk(
    'payment/create',
    async (params: { tariff: string; amount: number }, { rejectWithValue }) => {
        try {
            // Когда бэк будет готов:
            // const response = await instance.post('api/payments/create', params);
            // return response.data; // { paymentUrl: 'https://...' }

            return { paymentUrl: null };
        } catch (err: any) {
            return rejectWithValue(err.response?.data ?? err.message);
        }
    }
);

const initialState: {
    loading: boolean;
    paymentHistory: any[];
    paymentUrl: string | null;
} = {
    loading: false,
    paymentHistory: [],
    paymentUrl: null,
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentUrl: (state) => {
            state.paymentUrl = null;
        },
    },
    extraReducers: (builder) =>
        builder
            .addCase(getPaymentHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPaymentHistory.fulfilled, (state, { payload }) => {
                state.paymentHistory = payload;
                state.loading = false;
            })
            .addCase(getPaymentHistory.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createPayment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createPayment.fulfilled, (state, { payload }) => {
                state.paymentUrl = payload.paymentUrl;
                state.loading = false;
            })
            .addCase(createPayment.rejected, (state) => {
                state.loading = false;
            }),
});

export const { clearPaymentUrl } = paymentSlice.actions;
export default paymentSlice.reducer;