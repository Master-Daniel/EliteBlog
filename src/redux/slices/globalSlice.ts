import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    isLoggedIn?: boolean;
}

interface GlobalState {
    isLoggedIn: boolean;
    isSidebarOpen: boolean;
    theme: string;
    userData?: UserData;
    isModalOpen: boolean;
}

const initialState: GlobalState = {
    isLoggedIn: false,
    isSidebarOpen: false,
    isModalOpen: false,
    theme: "dark"
}

const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload
        },
        setIsModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isModalOpen = action.payload
        },
        setIsSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload
        },
        setUserData: (state, action: PayloadAction<Partial<UserData>>) => {
            state.userData = { ...state.userData, ...action.payload }
        },
        setTheme: (state, action: PayloadAction<string>) => {
            state.theme = action.payload
        }
    }
});

export const { setIsLoggedIn, setIsModalOpen, setTheme, setUserData, setIsSidebarOpen } = globalSlice.actions;
export default globalSlice.reducer;