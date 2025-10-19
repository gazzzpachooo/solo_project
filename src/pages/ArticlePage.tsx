import React, { useEffect, useState, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import MainLayout from "../layouts/MainLayout";
import Input from "../shared/ui/Input/Input";
import Textarea from "../shared/ui/Textarea/Textarea";
import Button from "../shared/ui/Button/Button";

import { api } from "../api/api";
import { useAppDispatch } from "../store/store";
import { selectAuth, selectIsAuthenticated } from "../store/slices/authSlice";
import {
  changeInfoThunk,
  redoContentThunk,
  addContentThunk,
} from "../store/slices/newArticleSlice";

import type { Article, ContentBlock, MainInfo } from "../shared/Types/types";
import styles from "./ArticlePage.module.scss";
import { selectProfile } from "../store/slices/profileSlice";
import Select from "../shared/ui/Select/Select";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuth = useSelector(selectIsAuthenticated);
  const { username, password } = useSelector(selectAuth);

  // Оригинальные данные статьи
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Локальный стейт для инлайн-редактирования
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedPreview, setEditedPreview] = useState("");
  const [editedInfo, setEditedInfo] = useState<MainInfo>({});
  const [editedBlocks, setEditedBlocks] = useState<ContentBlock[]>([]);
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);

  const [newType, setNewType] = useState<ContentBlock["type"]>("p");
  const [newContent, setNewContent] = useState<string>("");
  const [insertPos, setInsertPos] = useState<number | undefined>(undefined);

  const profile = useSelector(selectProfile);
  let isAuthor = false;

  // Загрузка статьи при монтировании
  useEffect(() => {
    if (!id) {
      setError("Неверный идентификатор статьи");
      setLoading(false);
      return;
    }
    api.CreatearticlesApi.getArticleById(Number(id))
      .then((data) => {
        setArticle(data);
        setEditedTitle(data.title);
        setEditedPreview(data.previewImg);
        setEditedInfo(data.mainInfo);
        setEditedBlocks(data.mainContent);
      })
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
        <div className={styles.messageError}>
          {error || "Статья не найдена"}
        </div>
      </MainLayout>
    );
  }

  if (profile) {
    isAuthor = isAuth && article.author === profile.name;
  }
  // Автор может редактировать

  // Переключить общий режим редактирования
  const toggleEditMode = () => {
    if (isEditMode && article) {
      // Отмена: сбросить локальные значения
      setEditedTitle(article.title);
      setEditedPreview(article.previewImg);
      setEditedInfo(article.mainInfo);
      setEditedBlocks(article.mainContent);
      setEditingBlockIdx(null);
    }
    setIsEditMode((m) => !m);
  };

  // Сохранить всё: сначала info, затем контент
  const handleSaveAll = async () => {
    if (!article) return;
    try {
      // 1) Обновляем заголовок, previewImg и mainInfo
      await dispatch(
        changeInfoThunk({
          creds: { username, password },
          id: Number(id),
          newInfo: {
            // mainInfo
            name: editedInfo.name,
            image: editedInfo.image,
            age: editedInfo.age,
            birthday: editedInfo.birthday,
            gender: editedInfo.gender,
            appearance: editedInfo.appearance,
            height: editedInfo.height,
            weight: editedInfo.weight,
            other: editedInfo.other,
            // top-level поля
            ...(editedTitle !== article.title ? { title: editedTitle } : {}),
            ...(editedPreview !== article.previewImg
              ? { previewImg: editedPreview }
              : {}),
          },
        })
      ).unwrap();

      // 2) Обновляем весь контент
      const updated = await dispatch(
        redoContentThunk({
          creds: { username, password },
          id: Number(id),
          newContent: editedBlocks,
        })
      ).unwrap();

      // Записываем обновленное и выходим из редактирования
      setArticle(updated);
      setEditedTitle(updated.title);
      setEditedPreview(updated.previewImg);
      setEditedInfo(updated.mainInfo);
      setEditedBlocks(updated.mainContent);
      setIsEditMode(false);
      setEditingBlockIdx(null);
    } catch {
      alert("Не удалось сохранить изменения");
    }
  };

  const handleAddBlock = async () => {
    if (!article) return;
    try {
      // готовим один блок
      const block: ContentBlock = {
        type: newType,
        content:
          newType === "ul" || newType === "ol"
            ? newContent
                .split("\n")
                .map((line) => ({ type: "li", content: line }))
            : newContent,
      };
      // диспатчим запрос на /addContent/{id}
      const updated = await dispatch(
        addContentThunk({
          creds: { username, password },
          id: Number(id),
          newBlocks: [block],
          position: insertPos,
        })
      ).unwrap();

      // синхронизируем локальный стейт
      setArticle(updated);
      setEditedBlocks(updated.mainContent);
      // сброс формы
      setNewContent("");
      setInsertPos(undefined);
    } catch {
      alert("Не удалось добавить блок");
    }
  };

  // Inline-редактирование одного блока
  const startBlockEdit = (idx: number) => setEditingBlockIdx(idx);
  const saveBlockEdit = () => setEditingBlockIdx(null);
  const deleteBlock = (idx: number) =>
    setEditedBlocks((blocks) => blocks.filter((_, i) => i !== idx));

  // Рендер блока в обычном режиме
  const renderViewBlock = (block: ContentBlock, key: number) => {
    switch (block.type) {
      case "h1":
        return <h1 key={key}>{block.content}</h1>;
      case "h2":
        return <h2 key={key}>{block.content}</h2>;
      case "p":
        return <p key={key}>{block.content}</p>;
      case "img":
        return (
          <img
            key={key}
            src={String(block.content)}
            alt=""
            className={styles.blockImage}
          />
        );
      case "ul":
      case "ol":
        const Tag = block.type as "ul" | "ol";
        return (
          <Tag key={key}>
            {Array.isArray(block.content) &&
              block.content.map((li: any, i: number) => (
                <li key={i}>{li.content}</li>
              ))}
          </Tag>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className={styles.articleDetail}>
        {/* Управление режимом */}
        {isAuthor && (
          <div className={styles.editControls}>
            {!isEditMode ? (
              <Button onClick={toggleEditMode}>Редактировать статью</Button>
            ) : (
              <>
                <Button className={styles.saveButton} onClick={handleSaveAll}>
                  Сохранить всё
                </Button>
                <Button
                  className={styles.cancelButton}
                  onClick={toggleEditMode}
                >
                  Отменить
                </Button>
              </>
            )}
          </div>
        )}

        {/* Заголовок */}
        {!isEditMode ? (
          <h2 className={styles.articleTitle}>{article.title}</h2>
        ) : (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
        )}

        {/* Автор */}
        <p className={styles.articleAuthor}>Автор: {article.author}</p>

        {/* Превью */}
        {!isEditMode ? (
          article.previewImg && (
            <img
              className={styles.articlePreview}
              src={article.previewImg}
              alt={article.title}
            />
          )
        ) : (
          <Input
            placeholder="URL картинки"
            value={editedPreview}
            onChange={(e) => setEditedPreview(e.target.value)}
          />
        )}

        {/* Информация о персонаже */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Информация о персонаже</h3>
          <div className={styles.infoGrid}>
            {(
              [
                ["name", "Имя"],
                ["image", "Изображение (URL)"],
                ["age", "Возраст"],
                ["birthday", "Дата рождения"],
                ["gender", "Пол"],
                ["appearance", "Внешность"],
                ["height", "Рост"],
                ["weight", "Вес"],
              ] as [keyof MainInfo, string][]
            ).map(([key, label]) => (
              <div className={styles.infoItem} key={key}>
                <span className={styles.infoLabel}>{label}:</span>
                {!isEditMode ? (
                  <span className={styles.infoValue}>
                    {String((editedInfo as any)[key] ?? "—")}
                  </span>
                ) : (
                  <Input
                    type={key === "age" ? "number" : "text"}
                    value={String((editedInfo as any)[key] ?? "")}
                    onChange={(e) =>
                      setEditedInfo({
                        ...editedInfo,
                        [key]:
                          key === "age"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                )}
              </div>
            ))}

            {/* Дополнительные поля */}
            {Object.entries(editedInfo.other || {}).map(
              ([otherKey, otherVal]) => (
                <div className={styles.infoItem} key={otherKey}>
                  <span className={styles.infoLabel}>{otherKey}:</span>
                  {!isEditMode ? (
                    <span className={styles.infoValue}>{String(otherVal)}</span>
                  ) : (
                    <Input
                      value={String(otherVal)}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          other: {
                            ...(editedInfo.other || {}),
                            [otherKey]: e.target.value,
                          },
                        })
                      }
                    />
                  )}
                </div>
              )
            )}
          </div>
        </section>

        {/* Контент статьи */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Контент статьи</h3>
          <div className={styles.articleContent}>
            {editedBlocks.map((block, idx) => (
              <div key={idx} className={styles.blockItem}>
                {isEditMode && editingBlockIdx === idx ? (
                  <Fragment>
                    {/* Inline-редактирование */}
                    {(block.type === "p" ||
                      block.type === "h1" ||
                      block.type === "h2") &&
                      (block.type === "p" ? (
                        <Textarea
                          value={String(block.content)}
                          onChange={(e) => {
                            const copy = [...editedBlocks];
                            copy[idx] = { ...block, content: e.target.value };
                            setEditedBlocks(copy);
                          }}
                        />
                      ) : (
                        <Input
                          value={String(block.content)}
                          onChange={(e) => {
                            const copy = [...editedBlocks];
                            copy[idx] = { ...block, content: e.target.value };
                            setEditedBlocks(copy);
                          }}
                        />
                      ))}

                    {/* Кнопки для сохранения/отмены блока */}
                    <div className={styles.blockButtons}>
                      <Button
                        className={styles.saveButton}
                        onClick={saveBlockEdit}
                      >
                        Сохранить блок
                      </Button>
                      <Button
                        className={styles.cancelButton}
                        onClick={() => setEditingBlockIdx(null)}
                      >
                        Отменить
                      </Button>
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    {/* Обычный рендер */}
                    {renderViewBlock(block, idx)}
                    {isAuthor && isEditMode && (
                      <div className={styles.blockButtons}>
                        <Button
                          className={styles.saveButton}
                          onClick={() => startBlockEdit(idx)}
                        >
                          Редактировать блок
                        </Button>
                        <Button
                          className={styles.cancelButton}
                          onClick={() => deleteBlock(idx)}
                        >
                          Удалить блок
                        </Button>
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
            ))}

            {/* Добавить новый абзац */}
            {isAuthor && isEditMode && (
              <Button
                className={styles.saveButton}
                onClick={() =>
                  setEditedBlocks((blocks) => [
                    ...blocks,
                    { type: "p", content: "Новый абзац" },
                  ])
                }
              >
                Добавить абзац
              </Button>
            )}
          </div>
        </section>

        {isEditMode && (
          <section className={styles.addBlock}>
            <h4>Добавить новый блок</h4>

            <label>
              Тип блока:
              <Select
                value={newType}
                onChange={(value) => setNewType(value as any)}
                options={[
                  { value: "", label: "Выберите тип" },
                  { value: "h1", label: "Заголовок" },
                  { value: "h2", label: "Подзаголовок" },
                  { value: "p", label: "Параграф" },
                  { value: "ul", label: "Список" },
                  { value: "ol", label: "Нумерованный список" },
                  { value: "img", label: "Изображение" },
                ]}
              />
            </label>

            <label>
              Содержимое:
              {newType === "img" ? (
                <Input
                  placeholder="URL картинки"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              ) : newType === "ul" || newType === "ol" ? (
                <Textarea
                  placeholder="Каждый элемент — с новой строки"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              ) : (
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              )}
            </label>

            <label>
              Позиция вставки (индекс блока):
              <Input
                type="number"
                value={String(insertPos) ?? ""}
                onChange={(e) =>
                  setInsertPos(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </label>

            <Button onClick={handleAddBlock}>Добавить блок</Button>
          </section>
        )}

        {/* Кнопка «Назад» */}
        <div className={styles.backButtonContainer}>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    </MainLayout>
  );
}
