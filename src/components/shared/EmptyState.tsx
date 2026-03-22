import styles from './EmptyState.module.css'

interface Props {
  emoji: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ emoji, title, description, action }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.emoji}>{emoji}</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && (
        <button className={styles.button} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
