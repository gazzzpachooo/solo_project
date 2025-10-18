import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../api/api";
import { login, logOut, selectAuth, selectIsAuthenticated } from "../store/slices/authSlice";
import {
  fetchProfile,
  selectProfile,
  selectProfileError,
  selectProfileLoading,
} from "../store/slices/profileSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import type { ArticleShort, Credentials } from "../shared/Types/types";
import styles from "./ProfilePage.module.scss";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // 1) Данные аутентификации и профиль
  const isAuth = useAppSelector(selectIsAuthenticated);
  const { username, password } = useAppSelector(selectAuth) as Credentials;
  const profile = useAppSelector(selectProfile);
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);

  // 2) Список «мои статьи»
  const [articles, setArticles] = useState<ArticleShort[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  // Формы входа
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchProfile());
      loadMyArticles();
    }
  }, [dispatch, isAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login({ username: loginName, password: loginPass })).unwrap();
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/");
  };

  const loadMyArticles = async () => {
    setArtLoading(true);
    setArtError(null);
    try {
      const myArts = await api.CreatearticlesApi.getMyArticles({ username, password });
      setArticles(myArts);
    } catch {
      setArtError("Не удалось загрузить ваши статьи");
    } finally {
      setArtLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить статью?")) return;
    try {
      await api.CreatearticlesApi.deleteArticle({ username, password }, id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Ошибка при удалении статьи");
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/newArticle?editId=${id}`); 
  };

  return (
    <MainLayout>
      <div className={styles.profileContainer}>
        {!isAuth && (
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <h2>Вход</h2>
            <input
              type="text"
              placeholder="Логин"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              required
            />
            <button type="submit">Войти</button>
          </form>
        )}

        {isAuth && (
          <>
            <div className={styles.userInfo}>
              {profileLoading && <p>Загрузка профиля...</p>}
              {profileError && <p className={styles.error}>{profileError}</p>}

              {profile && (
                <>
                  <img src={profile.ava} alt="Avatar" className={styles.avatar} />
                  <h2 className={styles.userName}>{profile.name}</h2>
                  <div className={styles.buttonGroup}>
                    <button onClick={() => navigate("/profile/edit")}>Редактировать профиль</button>
                    <button onClick={handleLogout}>Выйти</button>
                  </div>
                </>
              )}
            </div>

            <div className={styles.stats}>
              <h3>Статистика</h3>
              {artLoading ? (
                <p>Загрузка...</p>
              ) : artError ? (
                <p className={styles.error}>{artError}</p>
              ) : (
                <p>Написано статей: {articles.length}</p>
              )}
            </div>

            <div className={styles.myArticles}>
              <h3>Мои статьи</h3>
              <ul className={styles.articleList}>
                {articles.map((a) => (
                  <li key={a.id} className={styles.articleItem}>
                    <span className={styles.articleTitle}>{a.title}</span>
                    <div className={styles.articleActions}>
                      <button onClick={() => handleEdit(a.id)}>Редактировать</button>
                      <button onClick={() => handleDelete(a.id)}>Удалить</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
