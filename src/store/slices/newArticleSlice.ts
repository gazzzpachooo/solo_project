// src/store/slices/newArticleSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  Article,
  ArticleCreate,
  Credentials,
  MainInfo,
  ContentBlock,
} from "../../shared/Types/types";
import { api } from "../../api/api";
import type { RootState } from "../store";

// ----------------------------------------------------------------------------
// 1) Thunk для создания новой статьи
export const createArticleThunk = createAsyncThunk<
  Article,
  { creds: Credentials; articleData: ArticleCreate },
  { rejectValue: string }
>(
  "newArticle/create",
  async ({ creds, articleData }, { rejectWithValue }) => {
    try {
      return await api.CreatearticlesApi.createArticle(creds, articleData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Ошибка при создании статьи");
    }
  }
);

// ----------------------------------------------------------------------------
// 2) Thunk для частичного обновления mainInfo (/changeInfo/{id})
export const changeInfoThunk = createAsyncThunk<
  Article,
  { creds: Credentials; id: number; newInfo: Partial<MainInfo> },
  { rejectValue: string }
>(
  "newArticle/changeInfo",
  async ({ creds, id, newInfo }, { rejectWithValue }) => {
    try {
      return await api.CreatearticlesApi.changeInfo(creds, id, newInfo);
    } catch (error: any) {
      return rejectWithValue(error.message || "Ошибка при обновлении информации");
    }
  }
);

// ----------------------------------------------------------------------------
// 3) Thunk для полного замещения контента (/redoContent/{id})
export const redoContentThunk = createAsyncThunk<
  Article,
  { creds: Credentials; id: number; newContent: ContentBlock[] },
  { rejectValue: string }
>(
  "newArticle/redoContent",
  async ({ creds, id, newContent }, { rejectWithValue }) => {
    try {
      return await api.CreatearticlesApi.redoContent(creds, id, newContent);
    } catch (error: any) {
      return rejectWithValue(error.message || "Ошибка при обновлении контента");
    }
  }
);

// ----------------------------------------------------------------------------
// 4) Состояние и slice
interface NewArticleState {
  newArticle: Article | null;
  loading: boolean;
  error: string | null;
}

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
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createArticle
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
        state.error = action.payload ?? "Ошибка при создании статьи";
      })

      // changeInfo
      .addCase(changeInfoThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeInfoThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.newArticle = action.payload;
      })
      .addCase(changeInfoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка при обновлении информации";
      })

      // redoContent
      .addCase(redoContentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redoContentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.newArticle = action.payload;
      })
      .addCase(redoContentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка при обновлении контента";
      });
  },
});

export const { resetNewArticle } = newArticleSlice.actions;

// Селекторы
export const selectNewArticle = (state: RootState) =>
  state.newArticle.newArticle;
export const selectNewArticleLoading = (state: RootState) =>
  state.newArticle.loading;
export const selectNewArticleError = (state: RootState) =>
  state.newArticle.error;

export default newArticleSlice.reducer;
