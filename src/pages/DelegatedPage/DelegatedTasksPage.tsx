import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../shared/ui/Button/Button";
import Input from "../../shared/ui/Input/Input";
import Textarea from "../../shared/ui/Textarea/Textarea";
import s from "./DelegatedTask.module.scss";
import type { AppDispatch } from "../../store/store";

import {
  fetchDelegatedTasks,
  deleteDelegatedTask,
  updateDelegatedTask,
} from "../../store/slices/delegatedTasksSlice";

import { fetchUsers, selectAllUsers } from "../../store/slices/usersSlice";
import type { RootState } from "../../store/store";
import type { Task } from "../../shared/types/types";

import TaskFilter from "../../features/MyTasks/TaskFilters/TaskFilters";

function DelegatedTasksPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { tasks, loading, error } = useSelector(
    (state: RootState) => state.delegatedTasks
  );
  const users = useSelector(selectAllUsers);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  // фильтры
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    dispatch(fetchDelegatedTasks({}));
    dispatch(fetchUsers());
  }, [dispatch]);

  const getUserName = (id: number) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : `Пользователь #${id}`;
  };

  const getUserAva = (id: number) => {
    const user = users.find((u) => u.id === id);
    return user?.ava ?? "https://via.placeholder.com/40";
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await dispatch(
        updateDelegatedTask({
          taskId: Number(editingTask.id),
          update: { title, description, deadline },
        })
      ).unwrap();
      setEditingTask(null);
    } catch (err) {
      console.error("Ошибка при обновлении задачи:", err);
    }
  };

  const handleDelete = (taskId: number) => {
    dispatch(deleteDelegatedTask(taskId));
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setDeadlineFilter("");
    setAuthorFilter(null);
    setSortOrder(null);
  };

  // утилиты для статуса
  const getTaskStatusInfo = (task: Task) => {
    if (task.status === "completed") {
      return { status: "completed", isOverdue: false, overdueDays: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    const isOverdue = deadline < today;

    if (isOverdue) {
      const diffTime = Math.abs(today.getTime() - deadline.getTime());
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: "failed", isOverdue: true, overdueDays };
    }

    return { status: "in work", isOverdue: false, overdueDays: 0 };
  };

  const getOverdueInfo = (days: number) => {
    if (days === 0) return "";
    if (days % 10 === 1 && days % 100 !== 11) return `Просрочено на ${days} день`;
    if (
      days % 10 >= 2 &&
      days % 10 <= 4 &&
      (days % 100 < 10 || days % 100 >= 20)
    )
      return `Просрочено на ${days} дня`;
    return `Просрочено на ${days} дней`;
  };

  // применяем фильтры
  const filteredTasks = tasks
    .map((task) => {
      const statusInfo = getTaskStatusInfo(task);
      return {
        ...task,
        status: statusInfo.status,
        isOverdue: statusInfo.isOverdue,
        overdueDays: statusInfo.overdueDays,
        overdueInfo: getOverdueInfo(statusInfo.overdueDays),
      };
    })
    .filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (deadlineFilter && task.deadline > deadlineFilter) return false;
      if (authorFilter && task.author.toString() !== authorFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortOrder === "desc") {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      return 0;
    });

  return (
    <MainLayout>
      <div className={s.container}>
        <h1 className={s.heading}>Мои делегированные задачи</h1>

        {/* Фильтры */}
        <TaskFilter
          statusFilter={statusFilter}
          deadlineFilter={deadlineFilter}
          authorFilter={authorFilter}
          sortOrder={sortOrder}
          onStatusChange={setStatusFilter}
          onDeadlineChange={setDeadlineFilter}
          onAuthorChange={setAuthorFilter}
          onSortChange={setSortOrder}
          onReset={handleResetFilters}
          users={users}
        />

        {loading && <p>Загрузка...</p>}
        {error && <p className={s.error}>{error}</p>}

        <ul className={s.taskList}>
          {filteredTasks.map((task) => (
            <li key={task.id} className={s.taskCard}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>
                <strong>Дедлайн:</strong> {task.deadline}
              </p>

              {/* статус */}
              <p>
                <strong>Статус:</strong>{" "}
                {task.status === "completed" && "✅ Выполнена"}
                {task.status === "in work" && "🕒 В работе"}
                {task.status === "failed" && `❌ ${task.overdueInfo}`}
              </p>

              {/* исполнитель */}
              <div className={s.performer}>
                <img
                  src={getUserAva(task.performer)}
                  alt={getUserName(task.performer)}
                  width={40}
                  height={40}
                  className={s.avatar}
                />
                <span>{getUserName(task.performer)}</span>
              </div>

              <div className={s.buttons}>
                <Button variant="primary" onClick={() => handleEdit(task)}>
                  Редактировать
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDelete(Number(task.id))}
                >
                  Удалить
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {filteredTasks.length === 0 && !loading && !error && (
          <p className={s.noTasks}>Задачи не найдены</p>
        )}

        {editingTask && (
          <div className={s.editFormWrapper}>
            <h2>Редактирование задачи</h2>
            <form onSubmit={handleUpdate} className={s.form}>
              <div className={s.formGroup}>
                <label>Название</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={s.formGroup}>
                <label>Описание</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={s.formGroup}>
                <label>Дедлайн</label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className={s.buttonContainer}>
                <Button type="submit" variant="primary">
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTask(null)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default DelegatedTasksPage;
