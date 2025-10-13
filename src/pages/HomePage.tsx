import MainLayout from '../layouts/MainLayout'

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import { fetchArticles, selectArticles, selectArticlesLoading, selectArticlesError } from "../store/slices/articleSlice";

export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const articles = useSelector(selectArticles);
  const loading = useSelector(selectArticlesLoading);
  const error = useSelector(selectArticlesError);

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Все статьи</h2>
      {articles.length === 0 && <p>Статей нет</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {articles.map((article) => (
          <div key={article.id} style={{ border: "1px solid #ccc", padding: 10, width: 200 }}>
            <img
              src={article.previewImg}
              alt={article.title}
              style={{ width: "100%", height: 120, objectFit: "cover" }}
            />
            <h4>{article.title}</h4>
          </div>
        ))}
      </div>
    </div>

    </MainLayout>

  );
}
