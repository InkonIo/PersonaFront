import { createSlice, PayloadAction} from '@reduxjs/toolkit'


export interface HomeState {
    searchFields: any
    loading: boolean
}

const initialState: HomeState = {
    searchFields: {
        id: '',
        login: '',
        fullName: '',
        ageFrom: "",
        ageTo: "",
        country: "",
        city: "",
        fieldOfWork: "",
        professions: [],
        status: "",
        email: "",
        linksToSocial: "",
        maritalStatuses: "",
        educationAndCourses: "",
        experienceAndSkills: "",
        minDesiredIncome: '',
        maxDesiredIncome: '',
        dreamWork: "",
        hobby: "",
    },

    loading: false,
}

const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {
        updateSearchFields: (state, action: PayloadAction<{ name: string, value: any }>) => {
            const { name, value } = action.payload;
            state.searchFields[name] = value;
        },
        resetHomeState: () => initialState,  // 👈 добавить
    },
})

export const { updateSearchFields, resetHomeState } = homeSlice.actions;

export default homeSlice.reducer