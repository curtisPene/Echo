import { Component, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.root}>
          <span className={styles.title}>Something went wrong</span>
          <p className={styles.message}>
            The app received unexpected data and can't continue safely.
            Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
