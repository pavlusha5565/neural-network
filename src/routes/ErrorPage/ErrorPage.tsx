import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Container, NavLink } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ ...this.state, error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container>
          <h1>{this.state.error?.message}</h1>
          <Link
            className="btn btn-primary"
            to={"/"}
            onClick={() => {
              this.setState({ hasError: false });
            }}
          >
            Back to home
          </Link>
        </Container>
      );
    }

    return this.props.children;
  }
}
