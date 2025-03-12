import React from "react";
import { Button, Typography, Box } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            textAlign: "center",
            mt: 5,
            p: 4,
            border: "1px solid red",
            borderRadius: 2,
            backgroundColor: "#fff3f3",
          }}
        >
          <Typography variant="h5" color="error">
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {this.state.error?.toString()}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={this.handleReload}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
