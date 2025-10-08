import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import { login, logOut } from "../store/slices/authSlice";
import { fetchProfile, updateProfile, selectProfile, selectProfileError, selectProfileLoading } from "../store/slices/profileSlice";
import MainLayout from "../layouts/MainLayout";

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>();

    const profile = useSelector(selectProfile);
    const loading = useSelector(selectProfileLoading);
    const error = useSelector(selectProfileError);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [editName, setEditName] = useState("");
    const [editAva, setEditAva] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const isLoggedIn = profile !== null;

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // ждем успешного login
        const result = await dispatch(login({ username, password })).unwrap();
        // после успешного login загружаем профиль
        await dispatch(fetchProfile());
    } catch (err) {
        console.log("Ошибка входа:", err);
    }
};


    const handleLogout = () => {
        dispatch(logOut());
        window.location.reload();
    };

    const handleEdit = () => {
        if (profile) {
            setEditName(profile.name);
            setEditAva(profile.ava);
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        await dispatch(updateProfile({ name: editName, ava: editAva }));
        setIsEditing(false);
    };

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchProfile());
        }
    }, [dispatch]);

    return (
        <MainLayout>
          <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
            <h2>Профиль пользователя</h2>

            {loading && <p>Загрузка...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!isLoggedIn && (
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                        type="text"
                        placeholder="Логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Войти</button>
                </form>
            )}

            {isLoggedIn && profile && (
                <div style={{ marginTop: 20 }}>
                    {!isEditing ? (
                        <>
                            <img src={profile.ava} alt="avatar" width={120} height={120} style={{ borderRadius: "50%" }} />
                            <h3>{profile.name}</h3>
                            <button onClick={handleEdit}>Редактировать</button>
                            <button onClick={handleLogout}>Выйти</button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Имя"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="URL аватара"
                                value={editAva}
                                onChange={(e) => setEditAva(e.target.value)}
                            />
                            <button onClick={handleSave}>Сохранить</button>
                            <button onClick={() => setIsEditing(false)}>Отмена</button>
                        </>
                    )}
                </div>
            )}
        </div>
        </MainLayout>
    );
}
