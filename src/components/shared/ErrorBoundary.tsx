import { Component, type ReactNode } from 'react'
import { EmptyState } from './EmptyState'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[SignalPlay] Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          emoji="⚠️"
          title="문제가 발생했어요"
          description="앱을 다시 열어주세요"
          action={{
            label: '새로고침',
            onClick: () => window.location.reload(),
          }}
        />
      )
    }
    return this.props.children
  }
}
