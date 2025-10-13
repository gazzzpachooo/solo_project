import { useState } from "react";
import type { FormEvent } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/store";
import {
  createArticleThunk,
  selectNewArticleLoading,
  selectNewArticleError,
} from "../store/slices/newArticleSlice";
import { selectIsAuthenticated, selectAuth } from "../store/slices/authSlice";
import type {
  ArticleCreate,
  ContentBlock,
  MainInfo,
} from "../shared/Types/types";
import MainLayout from "../layouts/MainLayout";

interface OtherField {
  key: string;
  value: string;
}

export default function NewArticlePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuth = useSelector(selectIsAuthenticated);
  const { username, password } = useSelector(selectAuth);

  const loading = useSelector(selectNewArticleLoading);
  const error = useSelector(selectNewArticleError);

  // Основные поля
  const [title, setTitle] = useState("");
  const [previewImg, setPreviewImg] = useState("");

  // mainInfo
  const [mainInfo, setMainInfo] = useState<MainInfo>({
    name: "",
    image: "",
    age: undefined,
    birthday: "",
    gender: "",
    appearance: "",
    height: "",
    weight: "",
    other: {},
  });

  // динамические поля other
  const [otherFields, setOtherFields] = useState<OtherField[]>([]);

  // контент-блоки
  const [mainContent, setMainContent] = useState<ContentBlock[]>([]);
  const [blockType, setBlockType] = useState<ContentBlock["type"]>("");
  const [blockContent, setBlockContent] = useState<string>("");
  const [listItems, setListItems] = useState<string[]>([]);

  if (!isAuth) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <h2>Доступ запрещён</h2>
          <p>Чтобы создать статью, пожалуйста, войдите в систему.</p>
        </div>
      </MainLayout>
    );
  }

  // Добавить поле other
  const handleAddOther = () => {
    setOtherFields([...otherFields, { key: "", value: "" }]);
  };

  const handleRemoveOther = (idx: number) => {
    setOtherFields(otherFields.filter((_, i) => i !== idx));
  };

  const handleOtherChange = (
    idx: number,
    field: keyof OtherField,
    val: string
  ) => {
    const copy = [...otherFields];
    copy[idx][field] = val;
    setOtherFields(copy);
  };

  // Добавить блок контента
  const handleAddBlock = () => {
    let content: any = blockContent;
    if (blockType === "ul" || blockType === "ol") {
      content = listItems.filter((item) => item.trim() !== "").map((text) => ({
        type: "li",
        content: text,
      }));
    }

    setMainContent([
      ...mainContent,
      { type: blockType, content },
    ]);
    // сброс
    setBlockType("");
    setBlockContent("");
    setListItems([]);
  };

  // Добавить элемент списка при blockType = ul|ol
  const handleAddListItem = () => {
    setListItems([...listItems, ""]);
  };

  const handleListItemChange = (idx: number, val: string) => {
    const copy = [...listItems];
    copy[idx] = val;
    setListItems(copy);
  };

  // Отправка формы
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Сформируем other в mainInfo
    const otherObj: Record<string, any> = {};
    otherFields.forEach(({ key, value }) => {
      if (key.trim()) otherObj[key] = value;
    });

    const fullInfo: MainInfo = {
      ...mainInfo,
      other: Object.keys(otherObj).length ? otherObj : undefined,
    };

    const articleData: ArticleCreate = {
      title,
      previewImg,
      mainInfo: fullInfo,
      mainContent,
    };

    try {
      const newArticle = await dispatch(
        createArticleThunk({
          creds: { username, password },
          articleData,
        })
      ).unwrap();

      navigate(`/article/${newArticle.id}`);
    } catch {
      alert("Не удалось создать статью");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 700, margin: "40px auto" }}>
        <h2>Создать новую статью</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Загрузка...</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="URL превью изображения"
            value={previewImg}
            onChange={(e) => setPreviewImg(e.target.value)}
          />

          <h4>Информация о персонаже</h4>
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
            <input
              key={key}
              type={key === "age" ? "number" : "text"}
              placeholder={label}
              value={(mainInfo[key] as any) || ""}
              onChange={(e) =>
                setMainInfo({
                  ...mainInfo,
                  [key]: key === "age" ? Number(e.target.value) : e.target.value,
                })
              }
            />
          ))}

          <h5>Дополнительные поля (other)</h5>
          {otherFields.map((fld, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Ключ"
                value={fld.key}
                onChange={(e) => handleOtherChange(i, "key", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Значение"
                value={fld.value}
                onChange={(e) => handleOtherChange(i, "value", e.target.value)}
                required
              />
              <button type="button" onClick={() => handleRemoveOther(i)}>
                Удалить
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddOther}>
            Добавить поле other
          </button>

          <h4>Добавить блок контента</h4>
          <select
            value={blockType}
            onChange={(e) => setBlockType(e.target.value)}
            required
          >
            <option value="">Выберите тип</option>
            <option value="h1">h1</option>
            <option value="h2">h2</option>
            <option value="p">p</option>
            <option value="ul">ul</option>
            <option value="ol">ol</option>
            <option value="img">img</option>
          </select>

          {/* Для списков */}
          {(blockType === "ul" || blockType === "ol") && (
            <div style={{ marginLeft: 20 }}>
              <h6>Элементы списка</h6>
              {listItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Текст элемента"
                    value={item}
                    onChange={(e) => handleListItemChange(idx, e.target.value)}
                    required
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddListItem}>
                Добавить элемент списка
              </button>
            </div>
          )}

          {/* Для всех остальных */}
          {blockType && blockType !== "ul" && blockType !== "ol" && (
            <textarea
              placeholder="Содержимое блока"
              value={blockContent}
              onChange={(e) => setBlockContent(e.target.value)}
              required
            />
          )}

          <button
            type="button"
            disabled={!blockType || ((blockType !== "ul" && !blockContent) || (["ul","ol"].includes(blockType) && listItems.length === 0))}
            onClick={handleAddBlock}
          >
            Добавить блок
          </button>

          <button type="submit" disabled={loading}>
            Создать статью
          </button>
        </form>

        {mainContent.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Предпросмотр контента</h4>
            {mainContent.map((b, i) => (
              <div key={i}>
                <strong>{b.type}:</strong>{" "}
                {Array.isArray(b.content)
                  ? b.content.map((li: any, j: number) => (
                      <div key={j} style={{ marginLeft: 16 }}>• {li.content}</div>
                    ))
                  : b.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
