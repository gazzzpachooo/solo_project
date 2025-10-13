import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';   
import { api } from '../../api/api';


export interface ArticleState {
    id: number;
    title: string;
    previewImg: string;
}

interface ArticlesState {
    list: ArticleState[];
    loading: boolean;
    error: string | null;
}

const initialState: ArticlesState = {
    list: [],
    loading: false,
    error: null,
};

export const fetchArticles = createAsyncThunk<
    ArticleState[],
    void,
    { rejectValue: string }
    > (`articles/fetchArticles`, async (_, { rejectWithValue }) => {
        try {
            const response = await api.articlesApi.getArticles();
            return response as ArticleState[];
        } catch (error: any) {
            return rejectWithValue('Failed to fetch articles');
        }   
        
    }
);

export const articleSlice = createSlice({
    name: 'articles',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchArticles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticles.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchArticles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to fetch articles';
            });
    },
});
export const selectArticles = (state: RootState) => state.articles.list;
export const selectArticlesLoading = (state: RootState) => state.articles.loading;
export const selectArticlesError = (state: RootState) => state.articles.error;

export default articleSlice.reducer;
