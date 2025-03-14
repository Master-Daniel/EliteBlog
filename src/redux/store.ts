import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
// import expireReducer from 'redux-persist-transform-expire';
import storage from './storage';
import _globalSlice from './slices/globalSlice';

const persistConfig = {
    key: 'elite-blog',
    version: 1,
    storage: storage,
    // transforms: [
    //     expireReducer('userData', {
    //         expireSeconds: 2000,
    //         expiredState: null,
    //         autoExpire: true,
    //     }),
    //     expireReducer('accessLevels', {
    //         expireSeconds: 2000,
    //         expiredState: {},
    //         autoExpire: true,
    //     }),
    // ],
};

const rootReducer = combineReducers({
    global: _globalSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof rootReducer>;
