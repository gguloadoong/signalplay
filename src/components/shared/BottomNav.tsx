import { useLocation, useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

const tabs = [
  { path: '/', label: '투표', icon: '⚡', badge: false, exact: true },
  { path: '/result', label: '결과', icon: '🎯', badge: true, exact: true },
  { path: '/characters', label: '전문가', icon: '🔮', badge: false, exact: false },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav} role="tablist" aria-label="메인 네비게이션">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? location.pathname === tab.path
          : location.pathname.startsWith(tab.path)
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
              <span className={styles.icon}>{tab.icon}</span>
              {tab.badge && !isActive && <span className={styles.badge} />}
            </span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
