import MainLayout from '../layouts/MainLayout';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../store/slices/profileSlice';
import { checkAuth, setCreds, logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import styles from './ProfilePage.module.scss';

function ProfilePage() {
  const dispatch = useDispatch<any>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const { isAuth, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
  const creds = useSelector((state: RootState) => state.auth.creds);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuth && creds) {
      dispatch(fetchProfile(creds));
    }
  }, [dispatch, isAuth, creds]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCreds({ username, password }));
    dispatch(checkAuth({ username, password }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <h2 className={styles.title}>Профиль пользователя</h2>
        {!isAuth ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>
              {authLoading ? 'Проверка...' : 'Войти'}
            </button>
            {authError && <p className={styles.error}>{authError}</p>}
          </form>
        ) : (
          <>
            {loading && <p>Загрузка...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {profile && (
              <div style={{ textAlign: 'center' }}>
                <img src={profile.ava} alt="avatar" className={styles.avatar} />
                <h3>{profile.name}</h3>
                <button onClick={handleLogout} className={styles.buttonLogout}>
                  Выйти
                </button>
              </div>
            )}
            {!loading && !profile && !error && <p>Нет данных профиля</p>}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default ProfilePage;