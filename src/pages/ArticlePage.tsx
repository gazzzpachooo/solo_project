import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../api/api";
import type { Article, ContentBlock, MainInfo } from "../shared/Types/types";
import { renderBlock } from "./RenderBlck";

import styles from "./ArticlePage.module.scss";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Неверный идентификатор статьи");
      setLoading(false);
      return;
    }
    api.CreatearticlesApi
      .getArticleById(Number(id))
      .then((data) => setArticle(data))
      .catch(() => setError("Не удалось загрузить статью"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.message}>Загрузка статьи…</div>
      </MainLayout>
    );
  }
  if (error || !article) {
    return (
      <MainLayout>
        <div className={styles.messageError}>{error || "Статья не найдена"}</div>
      </MainLayout>
    );
  }

  const { title, author, previewImg, mainInfo, mainContent } = article;

  return (
    <MainLayout>
      <div className={styles.articleDetail}>
        <h2 className={styles.articleTitle}>{title}</h2>
        <p className={styles.articleAuthor}>Автор: {author}</p>

        {previewImg && (
          <img
            className={styles.articlePreview}
            src={previewImg}
            alt={title}
          />
        )}

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Информация о персонаже</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Имя:</span>
              <span className={styles.infoValue}>{mainInfo.name || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Изображение:</span>
              {mainInfo.image ? (
                <img
                  className={styles.infoImage}
                  src={mainInfo.image}
                  alt={mainInfo.name}
                />
              ) : (
                <span className={styles.infoValue}>—</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Возраст:</span>
              <span className={styles.infoValue}>
                {mainInfo.age ?? "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дата рождения:</span>
              <span className={styles.infoValue}>
                {mainInfo.birthday || "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Пол:</span>
              <span className={styles.infoValue}>
                {mainInfo.gender || "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Внешность:</span>
              <span className={styles.infoValue}>
                {mainInfo.appearance || "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Рост:</span>
              <span className={styles.infoValue}>
                {mainInfo.height || "—"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Вес:</span>
              <span className={styles.infoValue}>
                {mainInfo.weight || "—"}
              </span>
            </div>
            {mainInfo.other &&
              Object.entries(mainInfo.other).map(([key, value]) => (
                <div className={styles.infoItem} key={key}>
                  <span className={styles.infoLabel}>{key}:</span>
                  <span className={styles.infoValue}>
                    {String(value)}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Контент статьи</h3>
          <div className={styles.articleContent}>
            {mainContent.map((block: ContentBlock, idx: number) =>
              renderBlock(block, idx)
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
