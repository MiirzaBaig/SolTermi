"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center p-4 border-3 border-border bg-panel-bg text-center">
            <p className="text-text-secondary text-sm mb-2">Something went wrong</p>
            <Button size="sm" onClick={() => this.setState({ hasError: false })}>
              Retry
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
