import { useLocation, useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

const tabs = [
  { path: '/', label: '한 표', icon: '⚡', badge: false },
  { path: '/result', label: '뚜껑', icon: '🎯', badge: true },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav} role="tablist" aria-label="메인 네비게이션">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className={styles.iconWrap}>
              <span className={`${styles.icon} tossface`}>{tab.icon}</span>
              {tab.badge && !isActive && <span className={styles.badge} />}
            </span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
