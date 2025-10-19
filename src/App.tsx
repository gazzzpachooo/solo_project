import { BrowserRouter, Routes, Route } from 'react-router-dom';

import CreateArticlPage from './pages/CreateArticlPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import NotFoundPage from './pages/NotFoundPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/newArticle" element={<CreateArticlPage />} />
        <Route path="/newArticle/:articleId" element={<CreateArticlPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
