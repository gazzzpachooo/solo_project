import { BrowserRouter, Routes, Route } from 'react-router-dom';

import CreateArticlPage from './pages/CreateArticlPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/newArticle" element={<CreateArticlPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
