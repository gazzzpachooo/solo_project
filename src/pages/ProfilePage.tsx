import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../api/api";
import {
  login,
  logOut,
  selectAuth,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import {
  fetchProfile,
  updateProfile,
  selectProfile,
  selectProfileError,
  selectProfileLoading,
} from "../store/slices/profileSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import type { ArticleShort, Credentials } from "../shared/Types/types";
import styles from "./ProfilePage.module.scss";
import Input from "../shared/ui/Input/Input";

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

  // формы входа
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // inline-редактирование профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAva, setEditAva] = useState("");

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchProfile());
      loadMyArticles();
    }
  }, [dispatch, isAuth]);

  // когда профиль прилетел — заполняем поля редактирования
  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditAva(profile.ava);
    }
  }, [profile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      login({ username: loginName, password: loginPass })
    ).unwrap();
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/");
  };

  const loadMyArticles = async () => {
    setArtLoading(true);
    setArtError(null);
    try {
      const myArts = await api.CreatearticlesApi.getMyArticles({
        username,
        password,
      });
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
    navigate(`/newArticle/${id}`);
  };

  // сабмит формы редактирования профиля
  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({ name: editName, ava: editAva })).unwrap();
      setIsEditing(false);
    } catch {
      alert("Ошибка при сохранении профиля");
    }
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

              {profile && !isEditing && (
                <>
                  <img
                    src={profile.ava}
                    alt="Avatar"
                    className={styles.avatar}
                  />
                  <h2 className={styles.userName}>{profile.name}</h2>
                  <div className={styles.buttonGroup}>
                    <button type="button" onClick={() => setIsEditing(true)}>
                      Редактировать профиль
                    </button>
                    <button onClick={handleLogout}>Выйти</button>
                  </div>
                </>
              )}

              {profile && isEditing && (
                <form
                  className={styles.editForm}
                  onSubmit={handleProfileSave}
                >
                  <Input
                    type="text"
                    placeholder="Имя"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required = {true}
                  />
                  
                  <Input
                    type="text"
                    placeholder="URL аватарки"
                    value={editAva}
                    required = {true}
                    onChange={(e) => setEditAva(e.target.value)}
                  />
                  <div className={styles.buttonGroup}>
                    <button type="submit">Сохранить</button>
                    <button type="button" onClick={() => setIsEditing(false)}>
                      Отменить
                    </button>
                  </div>
                </form>
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
                      <button onClick={() => handleEdit(a.id)}>
                        Редактировать
                      </button>
                      <button onClick={() => handleDelete(a.id)}>
                        Удалить
                      </button>
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
