import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Credentials } from '../../shared/Types/types';
import { api } from '../../api/api';
import type { RootState } from '../store';

interface AuthState { 
    username: string;
    password: string;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    username: '',
    password: '',
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const login = createAsyncThunk<
    Credentials,
    Credentials,
    { rejectValue: string }
>(
    'auth/login',
    async (creds, { rejectWithValue }) => {
        try {
            await api.checkAuth(creds);
            return creds;
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 401) {
                return rejectWithValue('Неверный логин или пароль');
            }
            return rejectWithValue('Ошибка входа');
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<Credentials>) => {
            state.username = action.payload.username;
            state.password = action.payload.password;
            state.isAuthenticated = true;
        },
        logOut: (state) => {
            state.username = '';
            state.password = '';
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.username = action.payload.username;
                state.password = action.payload.password;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка входа';
            });
    },
});

export const { setCredentials, logOut } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;
