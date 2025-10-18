import axios from 'axios';
import type { UserProfile, Credentials, Profile, Article, ArticleShort, ArticleCreate  } from '../shared/Types/types';



const API_URL = 'http://localhost:8000' 
const axios_api = axios.create({baseURL: API_URL})

// getUserProfile

export const profileApi = {
   getProfile: async (creds?: Credentials): Promise<Profile> => {
        const res = await axios_api.get<Profile>("/myProfile", {
            auth: creds ? { username: creds.username, password: creds.password } : undefined,
        });
        return res.data;
    },

    updateProfile: async (creds?: Credentials, newProfile?: Partial<Profile>): Promise<Profile> => {
        if (!newProfile) {
            const error: any = new Error("Новые данные для профиля не были переданы");
            error.response = {
                data: { detail: "Новые данные для профиля не были переданы" },
                status: 400
            };
            throw error;
        }
        const res = await axios_api.put<Profile>(
            "/updateUser",
            newProfile,
            {
                auth: creds ? { username: creds.username, password: creds.password } : undefined,
            }
        );
        return res.data;
    }
}

export const checkAuth = async (creds: Credentials): Promise<void> => {
    await axios_api.get("/myProfile", {
        auth: { username: creds.username, password: creds.password },
    });
};

// getArticles

export const articlesApi = {
    getArticles: async (): Promise<any[]> => {
        try {
            const res = await axios_api.get<any[]>("/articles");
            return res.data;
        } catch (error: any) {
            throw new Error("Ошибка при получении статей");
        }
    }
}

// --- Статьи ---
export const CreatearticlesApi = {

  getMyArticles: async (creds: Credentials): Promise<ArticleShort[]> => {
    const res = await axios_api.get<ArticleShort[]>('/myArticles', {
      auth: { username: creds.username, password: creds.password },
    });
    return res.data;
  },

  deleteArticle: async (creds: Credentials, id: number): Promise<void> => {
    await axios_api.delete(`/articles/${id}`, {
      auth: { username: creds.username, password: creds.password },
    });
  },

  // Получить список всех статей (кратко)
  getArticles: async (): Promise<ArticleShort[]> => {
    try {
      const res = await axios_api.get<ArticleShort[]>('/articles');
        return res.data;
      } catch {
        throw new Error('Ошибка при получении статей');
      }
    },

    // Создать новую статью
    createArticle: async (creds: Credentials, article: ArticleCreate): Promise<Article> => {
      try {
        const res = await axios_api.post<Article>(
          '/createArticle',
          article,
          {
            auth: { username: creds.username, password: creds.password },
          }
        );
        return res.data;
      } catch (error: any) {
    console.error("Ошибка при создании статьи:", error.response?.data || error.message);
    throw new Error("Ошибка при создании статьи");
  }

    },

    // Получить статью по id
    getArticleById: async (id: number): Promise<Article> => {
      const res = await axios_api.get<Article>(`/articles/${id}`);
      return res.data;
    },
};

export const api = {
    articlesApi,
    profileApi,
    checkAuth,
    CreatearticlesApi
}
