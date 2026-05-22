import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage';


// ─── Ждём пока файл реально станет доступен по URL ───────────────────────────
const waitForImageAvailable = async (
    url: string,
    retries = 10,
    delayMs = 2000
): Promise<void> => {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) {
                console.log(`=== image available after ${i + 1} attempt(s) ===`);
                return;
            }
            console.log(`=== attempt ${i + 1}: status ${res.status}, retrying... ===`);
        } catch (err) {
            console.log(`=== attempt ${i + 1}: fetch error, retrying... ===`, err);
        }
        await new Promise(r => setTimeout(r, delayMs));
    }
    throw new Error('Image not available after upload — S3 consistency timeout');
};
// ─────────────────────────────────────────────────────────────────────────────


export const uploadImage = createAsyncThunk(
    'upload/image',
    async (formData: any, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            const response = await fetch('http://91.224.74.12:8080/public/images/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type НЕ ставим — fetch сам проставит с boundary
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                return rejectWithValue(error);
            }

            const data = await response.json();
            console.log('=== uploadImage response ===', data);

            // Ждём пока S3 реально отдаст файл по URL,
            // только после этого резолвим thunk и отдаём URL на фронт
            await waitForImageAvailable(data.imageUrl);

            return data;
        } catch (err: any) {
            console.log('=== uploadImage ERROR ===', err.message);
            return rejectWithValue({ message: err.message });
        }
    }
);


const initialState = {
    loading: false,
}

const imageSlice = createSlice({
    name: 'image',
    initialState,
    reducers: {},
    extraReducers: (builder) =>
        builder
            .addCase(uploadImage.pending, state => {
                state.loading = true;
            })
            .addCase(uploadImage.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(uploadImage.rejected, (state) => {
                state.loading = false;
            })
})

export default imageSlice.reducer