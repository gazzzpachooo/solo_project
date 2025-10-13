import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Article, ArticleCreate, Credentials } from "../../shared/Types/types";
import { api } from "../../api/api";
import type { RootState } from "../store";

// Асинхронный thunk для создания статьи
export const createArticleThunk = createAsyncThunk<
  Article,
  { creds: Credentials; articleData: ArticleCreate },
  { rejectValue: string }
>(
  "newArticle/create",
  async ({ creds, articleData }, { rejectWithValue }) => {
    try {
      const newArticle = await api.CreatearticlesApi.createArticle(creds, articleData);
      return newArticle;
    } catch (error: any) {
      return rejectWithValue(error.message || "Ошибка при создании статьи");
    }
  }
);

// Состояние
interface NewArticleState {
  newArticle: Article | null;
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: NewArticleState = {
  newArticle: null,
  loading: false,
  error: null,
};

export const newArticleSlice = createSlice({
  name: "newArticle",
  initialState,
  reducers: {
    resetNewArticle(state) {
      state.newArticle = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createArticleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.newArticle = action.payload;
      })
      .addCase(createArticleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка при создании статьи";
      });
  },
});

export const { resetNewArticle } = newArticleSlice.actions;
export const selectNewArticle = (state: RootState) => state.newArticle.newArticle;
export const selectNewArticleLoading = (state: RootState) => state.newArticle.loading;
export const selectNewArticleError = (state: RootState) => state.newArticle.error;
