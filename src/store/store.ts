import { configureStore } from '@reduxjs/toolkit';
import { profileSlice } from './slices/profileSlice';
import { authSlice } from './slices/authSlice';
import { articleSlice } from './slices/articleSlice';
import { newArticleSlice } from './slices/newArticleSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

// Конфигурация Redux store с подключенными редьюсерами
export const store = configureStore({
  reducer: {
      profile: profileSlice.reducer,
      auth: authSlice.reducer,
      articles: articleSlice.reducer,
      newArticle: newArticleSlice.reducer,
    // Когда реализуете слайсы добавите их 
  },
});

// Типы для TypeScript интеграции
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;