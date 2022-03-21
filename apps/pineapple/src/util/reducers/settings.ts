import { configureStore } from "@reduxjs/toolkit";
import token from "./token";
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

const store = configureStore({
    reducer: {
        token,
    },
});

export type RootState = ReturnType<typeof store.getState>
export default store;
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector