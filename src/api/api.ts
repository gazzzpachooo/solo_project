import axios from 'axios';
import type {
  Credentials,
  Profile,
  Article,
  ArticleShort,
  ArticleCreate,
  MainInfo,
  ContentBlock
} from '../shared/Types/types';
import { createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000';
const axios_api = axios.create({ baseURL: API_URL });

// === Profile API ============================================================
export const profileApi = {
  getProfile: async (creds?: Credentials): Promise<Profile> => {
    const res = await axios_api.get<Profile>('/myProfile', {
      auth: creds
        ? { username: creds.username, password: creds.password }
        : undefined
    });
    return res.data;
  },

  updateProfile: async (
    creds?: Credentials,
    newProfile?: Partial<Profile>
  ): Promise<Profile> => {
    if (!newProfile) {
      const error: any = new Error(
        'Новые данные для профиля не были переданы'
      );
      error.response = {
        data: { detail: 'Новые данные для профиля не были переданы' },
        status: 400
      };
      throw error;
    }
    const res = await axios_api.put<Profile>('/updateUser', newProfile, {
      auth: creds
        ? { username: creds.username, password: creds.password }
        : undefined
    });
    return res.data;
  }
};

// === Auth check =============================================================
export const checkAuth = async (creds: Credentials): Promise<void> => {
  await axios_api.get('/myProfile', {
    auth: { username: creds.username, password: creds.password }
  });
};

// === Articles API ===========================================================
export const articlesApi = {
  getArticles: async (): Promise<ArticleShort[]> => {
    try {
      const res = await axios_api.get<ArticleShort[]>('/articles');
      return res.data;
    } catch (error: any) {
      throw new Error('Ошибка при получении статей');
    }
  }
};

// === My Articles / CRUD ====================================================
export const CreatearticlesApi = {
  getMyArticles: async (creds: Credentials): Promise<ArticleShort[]> => {
    const res = await axios_api.get<ArticleShort[]>('/myArticles', {
      auth: { username: creds.username, password: creds.password }
    });
    return res.data;
  },

  deleteArticle: async (creds: Credentials, id: number): Promise<void> => {
    await axios_api.delete(`/articles/${id}`, {
      auth: { username: creds.username, password: creds.password }
    });
  },

  getArticles: async (): Promise<ArticleShort[]> => {
    try {
      const res = await axios_api.get<ArticleShort[]>('/articles');
      return res.data;
    } catch {
      throw new Error('Ошибка при получении статей');
    }
  },

  createArticle: async (
    creds: Credentials,
    article: ArticleCreate
  ): Promise<Article> => {
    try {
      const res = await axios_api.post<Article>(
        '/createArticle',
        article,
        {
          auth: { username: creds.username, password: creds.password }
        }
      );
      return res.data;
    } catch (error: any) {
      console.error(
        'Ошибка при создании статьи:',
        error.response?.data || error.message
      );
      throw new Error('Ошибка при создании статьи');
    }
  },

  getArticleById: async (id: number): Promise<Article> => {
    const res = await axios_api.get<Article>(`/articles/${id}`);
    return res.data;
  },

  /**
   * Частично обновить mainInfo (через /changeInfo/{id})
   */
  changeInfo: async (
    creds: Credentials,
    id: number,
    newInfo: Partial<MainInfo>
  ): Promise<Article> => {
    const res = await axios_api.put<Article>(
      `/changeInfo/${id}`,
      newInfo,
      {
        auth: { username: creds.username, password: creds.password }
      }
    );
    return res.data;
  },

  /**
   * Полностью заменить mainContent (через /redoContent/{id})
   */
  redoContent: async (
    creds: Credentials,
    id: number,
    newContent: ContentBlock[]
  ): Promise<Article> => {
    const res = await axios_api.put<Article>(
      `/redoContent/${id}`,
      newContent,
      {
        auth: { username: creds.username, password: creds.password }
      }
    );
    return res.data;
  }
};

// === Redux Thunks для редактирования статьи ================================
export const changeInfoThunk = createAsyncThunk<
  Article,
  { id: number; creds: Credentials; newInfo: Partial<MainInfo> },
  { rejectValue: string }
>(
  'newArticle/changeInfo',
  async ({ id, creds, newInfo }, { rejectWithValue }) => {
    try {
      return await CreatearticlesApi.changeInfo(creds, id, newInfo);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const redoContentThunk = createAsyncThunk<
  Article,
  { id: number; creds: Credentials; newContent: ContentBlock[] },
  { rejectValue: string }
>(
  'newArticle/redoContent',
  async ({ id, creds, newContent }, { rejectWithValue }) => {
    try {
      return await CreatearticlesApi.redoContent(creds, id, newContent);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// === Экспорт всего API-пакета ==============================================
export const api = {
  articlesApi,
  profileApi,
  checkAuth,
  CreatearticlesApi
};
