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
        setFeeds: (state, action: PayloadAction<Partial<{ featured: Feed[]; feeds: Feed[] }>>) => {
            if (!state.feeds) {
                state.feeds = { featured: [], feeds: [] };
            }
            
            if (action.payload.feeds) {
                state.feeds.feeds = action.payload.feeds;
            }
            if (action.payload.featured) {
                state.feeds.featured = action.payload.featured;
            }
        },        
        setTheme: (state, action: PayloadAction<string>) => {
            state.theme = action.payload
        }
    }
});

export const { setIsLoggedIn, setTheme, setUserData, setIsSidebarOpen, setFeeds } = globalSlice.actions;
export default globalSlice.reducer;