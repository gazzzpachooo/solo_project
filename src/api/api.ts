import axios from 'axios';
import type { UserProfile, Credentials  } from '../shared/Types/types';



const API_URL = 'http://localhost:8000' 
const axios_api = axios.create({baseURL: API_URL})

// getUserProfile

export const profileApi = {
    getProfile: async (creds?: Credentials): Promise<UserProfile> => {
        try {
            const res = await axios_api.get<UserProfile>("/myProfile", {
                auth: creds ? {username: creds.username, password: creds.password} : undefined
            })
            return res.data
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                throw new Error("Неверные учетные данные");
            }
            throw new Error("Ошибка при получении профиля");
        }
    },
    checkAuth: async (creds: Credentials): Promise<boolean> => {
        try {
            await profileApi.getProfile(creds);
            return true;
        } catch (error) {
            return false;
        }
    }
}