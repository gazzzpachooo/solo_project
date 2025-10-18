// src/pages/NewArticlePage.tsx
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../store/store";
import {
  createArticleThunk,
  changeInfoThunk,
  redoContentThunk,
  selectNewArticleLoading,
  selectNewArticleError,
} from "../store/slices/newArticleSlice";
import {
  selectIsAuthenticated,
  selectAuth,
} from "../store/slices/authSlice";
import type {
  ArticleCreate,
  ContentBlock,
  MainInfo,
} from "../shared/Types/types";
import { api } from "../api/api";
import MainLayout from "../layouts/MainLayout";
import Input from "../shared/ui/Input/Input";
import Button from "../shared/ui/Button/Button";
import Textarea from "../shared/ui/Textarea/Textarea";
import Select from "../shared/ui/Select/Select";

interface OtherField {
  key: string;
  value: string;
}

export default function NewArticlePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId?: string }>();
  const isEditMode = Boolean(articleId);
  const idNum = articleId ? Number(articleId) : undefined;

  const isAuth = useSelector(selectIsAuthenticated);
  const { username, password } = useSelector(selectAuth);
  const loading = useSelector(selectNewArticleLoading);
  const error = useSelector(selectNewArticleError);

  // form state
  const [title, setTitle] = useState("");
  const [previewImg, setPreviewImg] = useState("");
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
  const [otherFields, setOtherFields] = useState<OtherField[]>([]);
  const [mainContent, setMainContent] = useState<ContentBlock[]>([]);
  const [blockType, setBlockType] = useState<ContentBlock["type"]>("");
  const [blockContent, setBlockContent] = useState("");
  const [listItems, setListItems] = useState<string[]>([]);

  // JSON editor for edit mode
  const [contentJson, setContentJson] = useState("");

  // load article if editing
  useEffect(() => {
    if (isEditMode && idNum) {
      api.CreatearticlesApi.getArticleById(idNum)
        .then((art) => {
          setTitle(art.title);
          setPreviewImg(art.previewImg);
          setMainInfo(art.mainInfo);

          if (art.mainInfo.other) {
            const arr = Object.entries(art.mainInfo.other).map(
              ([key, val]) => ({ key, value: String(val) })
            );
            setOtherFields(arr);
          }

          setContentJson(JSON.stringify(art.mainContent, null, 2));
        })
        .catch(() =>
          alert("Не удалось загрузить данные статьи для редактирования")
        );
    }
  }, [isEditMode, idNum]);

  if (!isAuth) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <h2>Доступ запрещён</h2>
          <p>Чтобы создавать или редактировать статью, войдите в систему.</p>
        </div>
      </MainLayout>
    );
  }

  // other-fields handlers
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

  // content-block handlers for create mode
  const handleAddListItem = () => {
    setListItems([...listItems, ""]);
  };
  const handleListItemChange = (idx: number, val: string) => {
    const copy = [...listItems];
    copy[idx] = val;
    setListItems(copy);
  };
  const handleAddBlock = () => {
    let content: any = blockContent;
    if (blockType === "ul" || blockType === "ol") {
      content = listItems
        .filter((item) => item.trim() !== "")
        .map((text) => ({ type: "li", content: text }));
    }
    setMainContent([...mainContent, { type: blockType, content }]);
    setBlockType("");
    setBlockContent("");
    setListItems([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // build other object
    const otherObj: Record<string, any> = {};
    otherFields.forEach(({ key, value }) => {
      if (key.trim()) otherObj[key] = value;
    });
    const fullInfo: MainInfo = {
      ...mainInfo,
      other: Object.keys(otherObj).length ? otherObj : undefined,
    };

    // determine content to send
    let contentToSend: ContentBlock[];
    if (isEditMode) {
      try {
        contentToSend = JSON.parse(contentJson) as ContentBlock[];
      } catch {
        alert("Неверный формат JSON в контенте статьи");
        return;
      }
    } else {
      contentToSend = mainContent;
    }

    const articleData: ArticleCreate = {
      title,
      previewImg,
      mainInfo: fullInfo,
      mainContent: contentToSend,
    };

    try {
      if (isEditMode && idNum) {
        // update mainInfo
        await dispatch(
          changeInfoThunk({
            creds: { username, password },
            id: idNum,
            newInfo: fullInfo,
          })
        ).unwrap();

        // update content
        const updated = await dispatch(
          redoContentThunk({
            creds: { username, password },
            id: idNum,
            newContent: contentToSend,
          })
        ).unwrap();

        navigate(`/article/${updated.id}`);
      } else {
        // create new article
        const created = await dispatch(
          createArticleThunk({
            creds: { username, password },
            articleData,
          })
        ).unwrap();
        navigate(`/article/${created.id}`);
      }
    } catch {
      alert(
        isEditMode
          ? "Не удалось сохранить изменения"
          : "Не удалось создать статью"
      );
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 700, margin: "40px auto" }}>
        <h2>{isEditMode ? "Редактировать статью" : "Создать новую статью"}</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Загрузка...</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Input
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
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
            <Input
              key={key}
              type={key === "age" ? "number" : "text"}
              placeholder={label}
              value={(mainInfo[key] as any) || ""}
              onChange={(e) =>
                setMainInfo({
                  ...mainInfo,
                  [key]:
                    key === "age"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          ))}

          <h5>Дополнительные поля (other)</h5>
          {otherFields.map((fld, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <Input
                type="text"
                placeholder="Ключ"
                value={fld.key}
                onChange={(e) =>
                  handleOtherChange(i, "key", e.target.value)
                }
                required
              />
              <Input
                type="text"
                placeholder="Значение"
                value={fld.value}
                onChange={(e) =>
                  handleOtherChange(i, "value", e.target.value)
                }
                required
              />
              <Button type="button" onClick={() => handleRemoveOther(i)}>
                Удалить
              </Button>
            </div>
          ))}
          <Button type="button" onClick={handleAddOther}>
            Добавить поле other
          </Button>

          {isEditMode ? (
            <>
              <h4>Редактирование контента (JSON)</h4>
              <Textarea
                value={contentJson}
                onChange={(e) => setContentJson(e.target.value)}
                placeholder="Массив блоков в JSON"
              />
            </>
          ) : (
            <>
              <h4>Добавить блок контента</h4>
              <Select
                value={blockType}
                onChange={(val) => setBlockType(val)}
                required
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
              {(blockType === "ul" || blockType === "ol") && (
                <div style={{ marginLeft: 20 }}>
                  <h6>Элементы списка</h6>
                  {listItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8 }}>
                      <Input
                        type="text"
                        placeholder="Текст элемента"
                        value={item}
                        onChange={(e) =>
                          handleListItemChange(idx, e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddListItem}>
                    Добавить элемент списка
                  </Button>
                </div>
              )}
              {blockType &&
                blockType !== "ul" &&
                blockType !== "ol" && (
                  <Textarea
                    placeholder="Содержимое блока"
                    value={blockContent}
                    onChange={(e) => setBlockContent(e.target.value)}
                    required
                  />
                )}
              <Button
                type="button"
                disabled={
                  !blockType ||
                  ((blockType !== "ul" &&
                    blockType !== "ol" &&
                    !blockContent) ||
                    (["ul", "ol"].includes(blockType) &&
                      listItems.length === 0))
                }
                onClick={handleAddBlock}
              >
                Добавить блок
              </Button>

              {mainContent.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4>Предпросмотр контента</h4>
                  {mainContent.map((b, i) => (
                    <div key={i}>
                      <strong>{b.type}:</strong>{" "}
                      {Array.isArray(b.content)
                        ? b.content.map((li: any, j: number) => (
                            <div key={j} style={{ marginLeft: 16 }}>
                              • {li.content}
                            </div>
                          ))
                        : b.content}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <Button type="submit" disabled={loading}>
            {isEditMode ? "Сохранить изменения" : "Создать статью"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
