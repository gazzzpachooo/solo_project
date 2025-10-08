import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi } from '../../api/api';
import type { UserProfile, Credentials } from '../../shared/Types/types';

export interface ProfileState {
	profile: UserProfile | null;
	loading: boolean;
	error: string | null;
}

const initialState: ProfileState = {
	profile: null,
	loading: false,
	error: null,
};

export const fetchProfile = createAsyncThunk<UserProfile, Credentials | undefined>(
	'profile/fetchProfile',
	async (creds, { rejectWithValue }) => {
		try {
			const data = await profileApi.getProfile(creds);
			return data;
		} catch (e: any) {
			return rejectWithValue(e.message || 'Ошибка загрузки профиля');
		}
	}
);

const profileSlice = createSlice({
	name: 'profile',
	initialState,
	reducers: {
		clearProfile(state) {
			state.profile = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProfile.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProfile.fulfilled, (state, action) => {
				state.loading = false;
				state.profile = action.payload;
				state.error = null;
			})
			.addCase(fetchProfile.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
