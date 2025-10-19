import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Button from "../shared/ui/Button/Button";

import styles from "./NotFoundPage.module.scss";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className={styles.notFound}>
        <h1>404</h1>
        <p>Упс! Такой страницы не существует.</p>
        <Button onClick={() => navigate("/")}>
          Вернуться на главную
        </Button>
      </div>
    </MainLayout>
  );
}
