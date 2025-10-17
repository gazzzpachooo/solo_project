import MainLayout from '../layouts/MainLayout'

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import { fetchArticles, selectArticles, selectArticlesLoading, selectArticlesError } from "../store/slices/articleSlice";
import { useNavigate } from 'react-router-dom';
import s from './HomePage.module.scss'
import Button from '../shared/ui/Button/Button';

export default function ArticlesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
      <div>
      <h2>Все статьи</h2>
      {articles.length === 0 && <p>Статей нет</p>}
      <div className={s.articleList}>
        {articles.map((article) => (
          <div key={article.id} className={s.articleItem}>
            <img
              src={article.previewImg}
              alt={article.title}
              className={s.articleImage}
            />
            <h4>{article.title}</h4>
             <Button
                onClick={() => navigate(`/article/${article.id}`)}
                variant='secondary'
              >
                Подробнее
              </Button>
          </div>
        ))}
      </div>
    </div>

    </MainLayout>

  );
}
