// src/pages/HomePage.tsx
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import {
  fetchArticles,
  selectArticles,
  selectArticlesLoading,
  selectArticlesError,
} from "../store/slices/articleSlice";
import { useNavigate } from "react-router-dom";
import s from "./HomePage.module.scss";
import Button from "../shared/ui/Button/Button";
import Input from "../shared/ui/Input/Input";

export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const articles = useSelector(selectArticles);
  const loading = useSelector(selectArticlesLoading);
  const error = useSelector(selectArticlesError);

  // Стейт поискового запроса
  const [searchTerm, setSearchTerm] = useState("");

  // Загрузка статей при монтировании
  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  // Фильтрация – case-insensitive по заголовку
  const filteredArticles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      a.title.toLowerCase().includes(q)
    );
  }, [articles, searchTerm]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <MainLayout>
      <div className={s.container}>
        <h2>Все статьи</h2>

        {/* Поисковая строка */}
        <Input
          type="text"
          placeholder="Поиск статей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={s.searchInput}
        />
        

        {filteredArticles.length === 0 ? (
          <p>Статей не найдено</p>
        ) : (
          <div className={s.articleList}>
            {filteredArticles.map((article) => (
              <div key={article.id} className={s.articleItem}>
                <img
                  src={article.previewImg}
                  alt={article.title}
                  className={s.articleImage}
                />
                <h4>{article.title}</h4>
                <Button
                  onClick={() => navigate(`/article/${article.id}`)}
                  variant="secondary"
                >
                  Подробнее
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
