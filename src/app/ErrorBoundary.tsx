import { Component, type ReactNode } from 'react'

import { StartupProblem } from './StartupProblem'

/** Une erreur inattendue affiche un écran clair (avec les détails) au lieu d'une page blanche. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <StartupProblem issue="error" detail={`${this.state.error.name}: ${this.state.error.message}`} />
    }
    return this.props.children
  }
}
