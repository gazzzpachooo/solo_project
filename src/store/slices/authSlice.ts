import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi } from '../../api/api';
import type { Credentials } from '../../shared/Types/types';

export interface AuthState {
	isAuth: boolean;
	loading: boolean;
	error: string | null;
	creds: Credentials | null;
}

const initialState: AuthState = {
	isAuth: false,
	loading: false,
	error: null,
	creds: null,
};

export const checkAuth = createAsyncThunk<boolean, Credentials>(
	'auth/checkAuth',
	async (creds, { rejectWithValue }) => {
		try {
			const result = await profileApi.checkAuth(creds);
			if (!result) throw new Error('Неверные данные');
			return true;
		} catch (e: any) {
			return rejectWithValue(e.message || 'Ошибка авторизации');
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logout(state) {
			state.isAuth = false;
			state.creds = null;
			state.error = null;
		},
		setCreds(state, action) {
			state.creds = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(checkAuth.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(checkAuth.fulfilled, (state, action) => {
				state.loading = false;
				state.isAuth = true;
				state.error = null;
			})
			.addCase(checkAuth.rejected, (state, action) => {
				state.loading = false;
				state.isAuth = false;
				state.error = action.payload as string;
			});
	},
});

export const { logout, setCreds } = authSlice.actions;
export default authSlice.reducer;
