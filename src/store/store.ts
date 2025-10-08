import { configureStore } from '@reduxjs/toolkit';
import { profileSlice } from './slices/profileSlice';
import { authSlice } from './slices/authSlice';


// Конфигурация Redux store с подключенными редьюсерами
export const store = configureStore({
  reducer: {
      profile: profileSlice.reducer,
      auth: authSlice.reducer,
    // Когда реализуете слайсы добавите их 
  },
});

// Типы для TypeScript интеграции
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch