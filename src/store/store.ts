import { configureStore } from '@reduxjs/toolkit';
import { testSlice } from './slices/testSlice';
import profileReducer from './slices/profileSlice';
import authReducer from './slices/authSlice';

// Конфигурация Redux store с подключенными редьюсерами
export const store = configureStore({
  reducer: {
    test: testSlice.reducer,
    profile: profileReducer,
    auth: authReducer,
  },
});

// Типы для TypeScript интеграции
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;