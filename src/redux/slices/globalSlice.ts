import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feed, GlobalState, UserData } from "../../utils/types";

const initialState: GlobalState = {
    isLoggedIn: false,
    isSidebarOpen: false,
    theme: "dark"
}

const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload
        },
        setIsSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload
        },
        setUserData: (state, action: PayloadAction<Partial<UserData>>) => {
            state.userData = { ...state.userData, ...action.payload }
        },
        setFeeds: (state, action: PayloadAction<Partial<Feed[]>>) => {
            state.feeds = { ...state.feeds, ...action.payload };
        },
        setTheme: (state, action: PayloadAction<string>) => {
            state.theme = action.payload
        }
    }
});

export const { setIsLoggedIn, setTheme, setUserData, setIsSidebarOpen, setFeeds } = globalSlice.actions;
export default globalSlice.reducer;