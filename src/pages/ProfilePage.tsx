import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  login,
  logOut,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthLoading,
} from "../store/slices/authSlice";
import {
  fetchProfile,
  updateProfile,
  selectProfile,
  selectProfileError,
  selectProfileLoading,
} from "../store/slices/profileSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import Button from "../shared/ui/Button/Button";
import Input from "../shared/ui/Input/Input";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // 1) Авторизация
  const isAuth = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  // 2) Профиль
  const profile = useAppSelector(selectProfile);
  const profileLoading = useAppSelector(selectProfileLoading);
  const profileError = useAppSelector(selectProfileError);

  // Локальные state для форм
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editName, setEditName] = useState("");
  const [editAva, setEditAva] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // После логина — сразу дергаем профиль
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuth]);

  // Обработчики
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login({ username, password })).unwrap();
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/");          // редирект на главную после логаута
  };

  const handleEdit = () => {
    if (profile) {
      setEditName(profile.name);
      setEditAva(profile.ava);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    await dispatch(updateProfile({ name: editName, ava: editAva })).unwrap();
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
        <h2>Профиль пользователя</h2>

        {/* 1) Форма входа */}
        {!isAuth && (
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {authError && <p style={{ color: "red" }}>{authError}</p>}
            <Input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={authLoading}>
              {authLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        )}

        {/* 2) Профиль и редактирование */}
        {isAuth && (
          <>
            {(profileLoading || profile === null) && (
              <p>Загрузка профиля...</p>
            )}
            {profileError && (
              <p style={{ color: "red" }}>{profileError}</p>
            )}

            {profile && !isEditing && (
              <div style={{ marginTop: 20 }}>
                <img
                  src={profile.ava}
                  alt="avatar"
                  width={120}
                  height={120}
                  style={{ borderRadius: "50%" }}
                />
                <h3>{profile.name}</h3>
                <Button onClick={handleEdit}>Редактировать</Button>
                <Button onClick={handleLogout}>Выйти</Button>
              </div>
            )}

            {profile && isEditing && (
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <Input
                  type="text"
                  placeholder="Имя"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="URL аватара"
                  value={editAva}
                  onChange={(e) => setEditAva(e.target.value)}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <Button onClick={handleSave}>Сохранить</Button>
                  <Button onClick={() => setIsEditing(false)}>Отмена</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
