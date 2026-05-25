import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DictionaryTypes } from "@/enum";
import { instance } from "@/store/api";
import i18n from "../../constants/i18n";
import { useState } from 'react';

// ─── Хелпер: выбирает нужное поле name по текущему языку ─────────────────────
export const getLocalizedName = (item: any, lang?: string): string => {
    if (!item) return '';
    const l = lang ?? i18n.language;
    if (l === 'en') return item.nameEn || item.name_en || item.nameRu || item.name_ru || item.name || '';
    if (l === 'kz') return item.nameKz || item.name_kz || item.nameRu || item.name_ru || item.name || '';
    return item.nameRu || item.name_ru || item.name || '';
};

export type RegionOrCity = {
    id: number;
    name: string;
    code: string;
    nameRu?: string;
    nameEn?: string;
    nameKz?: string;
};

const fetchData = async (dictionaryType: DictionaryTypes) => {
    const response = await instance.get(`public/dictionary/${dictionaryType}`);
    return response.data;
};


// ─── Все словари включая страны — с бэкенда ───────────────────────────────────
export const getAllDictionaryData = createAsyncThunk(
    'get/allDictionaryData',
    async (_, { rejectWithValue }) => {
        try {
            const [countries, maritalStatus, professions, statuses, workFields] = await Promise.all([
                fetchData(DictionaryTypes.COUNTRY),
                fetchData(DictionaryTypes.MARITAL_STATUS),
                fetchData(DictionaryTypes.PROFESSION),
                fetchData(DictionaryTypes.STATUS),
                fetchData(DictionaryTypes.WORK_FIELD),
            ]);

            // Сырые данные без сортировки — сортировка в селекторе
            return { countries, maritalStatus, professions, statuses, workFields };
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

// ─── Регионы по стране — с бэкенда ───────────────────────────────────────────
export const getCityByCountry = createAsyncThunk(
    'get/city/by/country',
    async (countryId: number | void, { rejectWithValue }) => {
        try {
            if (!countryId) return [];
            const lang = i18n.language === 'kz' ? 'kz' : i18n.language === 'en' ? 'en' : 'ru';
            const response = await instance.get(`/public/dictionary/region/filter?countryId=${countryId}&lang=${lang}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

// ─── Города по региону — с бэкенда ───────────────────────────────────────────
export const getRegion = createAsyncThunk(
    'get/region',
    async (regionId: number, { rejectWithValue }) => {
        try {
            const lang = i18n.language === 'kz' ? 'kz' : i18n.language === 'en' ? 'en' : 'ru';
            const response = await instance.get(`/public/dictionary/city/filter?regionId=${regionId}&lang=${lang}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

// ─── State ────────────────────────────────────────────────────────────────────
export interface DictionaryStateTypes {
    cities: any[];
    countries: any[];
    maritalStatus: any;
    professions: any;
    statuses: any;
    workFields: any;
    regions: any[];
    loading: boolean;
    selectedCity: null | number;
    selectedProfessions: null | any[];
}

const initialState: DictionaryStateTypes = {
    cities: [],
    countries: [],
    maritalStatus: [],
    professions: [],
    statuses: [],
    workFields: [],
    loading: false,
    regions: [],
    selectedCity: null,
    selectedProfessions: null,
};

const dictionarySlice = createSlice({
    name: 'dictionary',
    initialState,
    reducers: {
        setSelectedCity: (state, action: PayloadAction<number | null>) => {
            state.selectedCity = action.payload;
        },
        setSelectedProfessions: (state, action: PayloadAction<any[]>) => {
            state.selectedProfessions = action.payload;
        },
    },
    extraReducers: (builder) =>
        builder
            .addCase(getAllDictionaryData.pending, (state) => { state.loading = true; })
            .addCase(getAllDictionaryData.fulfilled, (state, { payload }) => {
                state.countries = payload.countries;
                state.maritalStatus = payload.maritalStatus;
                state.professions = payload.professions;
                state.statuses = payload.statuses;
                state.workFields = payload.workFields;
                state.loading = false;
            })
            .addCase(getAllDictionaryData.rejected, (state) => { state.loading = false; })

            .addCase(getCityByCountry.pending, (state) => { state.loading = true; })
            .addCase(getCityByCountry.fulfilled, (state, { payload }) => {
                state.regions = payload as any[];
                state.cities = [];
                state.loading = false;
            })
            .addCase(getCityByCountry.rejected, (state) => { state.loading = false; })

            .addCase(getRegion.pending, (state) => { state.loading = true; })
            .addCase(getRegion.fulfilled, (state, { payload }) => {
                state.cities = payload as any[];
                state.loading = false;
            })
            .addCase(getRegion.rejected, (state) => { state.loading = false; })
});

export const { setSelectedCity, setSelectedProfessions } = dictionarySlice.actions;
export default dictionarySlice.reducer;

// ─── Селекторы ────────────────────────────────────────────────────────────────

// Страны отсортированные по текущему языку.
// Пересчитывается автоматически при смене языка — сортировка НЕ хранится в store.
export const selectSortedCountries = createSelector(
    (state: { dictionary: DictionaryStateTypes }) => state.dictionary.countries,
    (_state: { dictionary: DictionaryStateTypes }, lang: string) => lang,
    (countries, lang) => {
        const locale = lang === 'ru' ? 'ru' : lang === 'kz' ? 'kk' : 'en';
        return [...countries].sort((a, b) =>
            getLocalizedName(a, lang).localeCompare(getLocalizedName(b, lang), locale)
        );
    }
);

// Регионы отсортированные по текущему языку.
export const selectSortedRegions = createSelector(
    (state: { dictionary: DictionaryStateTypes }) => state.dictionary.regions,
    (_state: { dictionary: DictionaryStateTypes }, lang: string) => lang,
    (regions, lang) => {
        const locale = lang === 'ru' ? 'ru' : lang === 'kz' ? 'kk' : 'en';
        return [...regions].sort((a, b) =>
            getLocalizedName(a, lang).localeCompare(getLocalizedName(b, lang), locale)
        );
    }
);

// Города отсортированные по текущему языку.
export const selectSortedCities = createSelector(
    (state: { dictionary: DictionaryStateTypes }) => state.dictionary.cities,
    (_state: { dictionary: DictionaryStateTypes }, lang: string) => lang,
    (cities, lang) => {
        const locale = lang === 'ru' ? 'ru' : lang === 'kz' ? 'kk' : 'en';
        return [...cities].sort((a, b) =>
            getLocalizedName(a, lang).localeCompare(getLocalizedName(b, lang), locale)
        );
    }
);

// Использование в компоненте:
// const lang = i18n.language;
// const countries = useSelector((state) => selectSortedCountries(state, lang));
// const regions = useSelector((state) => selectSortedRegions(state, lang));
// const cities = useSelector((state) => selectSortedCities(state, lang));