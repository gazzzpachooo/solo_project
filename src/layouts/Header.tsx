import { useNavigate } from 'react-router-dom'
import s from './Layout.module.scss'
import Button from '../shared/ui/Button/Button'

function Header() {
  const navigate = useNavigate()

  const navigationItems = [
    { path: '/', label: 'Главная' },
    { path: '/profile', label: 'Профиль' },
    { path: '/newArticle', label: 'Создать статью' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <header className={s.header}>
        <div className={s.header__content}>
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            variant="secondary"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </header>
  )
}

export default Header