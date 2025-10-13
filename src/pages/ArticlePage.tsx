import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ContentBlock, MainInfo } from "../shared/Types/types";
import { api } from "../api/api";
import MainLayout from "../layouts/MainLayout";

interface Article {
  id: number;
  title: string;
  previewImg: string;
  author: string;
  mainInfo: MainInfo;
  mainContent: ContentBlock[];
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await api.CreatearticlesApi.getArticleById(Number(id));
        setArticle(data);
      } catch {
        setError("Не удалось загрузить статью");
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <p style={{ textAlign: "center", marginTop: 40 }}>Загрузка...</p>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <p style={{ textAlign: "center", marginTop: 40, color: "red" }}>
          {error || "Статья не найдена"}
        </p>
      </MainLayout>
    );
  }

  const renderBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case "h1":
        return <h1 key={idx}>{block.content}</h1>;
      case "h2":
        return <h2 key={idx}>{block.content}</h2>;
      case "p":
        return <p key={idx}>{block.content}</p>;
      case "img":
        return (
          <img
            key={idx}
            src={block.content as string}
            alt=""
            style={{ maxWidth: "100%" }}
          />
        );
      case "ul":
        return (
          <ul key={idx}>
            {(block.content as any[]).map((li, j) => (
              <li key={j}>{li.content}</li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol key={idx}>
            {(block.content as any[]).map((li, j) => (
              <li key={j}>{li.content}</li>
            ))}
          </ol>
        );
      default:
        return (
          <div key={idx}>
            <strong>{block.type}:</strong> {String(block.content)}
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: "40px auto" }}>
        <h2>{article.title}</h2>
        <p>Автор: {article.author}</p>
        {article.previewImg && (
          <img
            src={article.previewImg}
            alt={article.title}
            style={{ width: "100%", maxHeight: 400, objectFit: "cover" }}
          />
        )}

        <h3>Информация о персонаже</h3>
        <dl>
          {Object.entries(article.mainInfo).map(([key, val]) => {
            if (val == null) return null;
            if (key === "other" && typeof val === "object") {
              return Object.entries(val as Record<string, any>).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ));
            }
            return (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{String(val)}</dd>
              </div>
            );
          })}
        </dl>

        <h3>Контент статьи</h3>
        {article.mainContent.map(renderBlock)}
      </div>
    </MainLayout>
  );
}
