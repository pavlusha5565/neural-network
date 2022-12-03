import React, { useEffect } from "react";
import AppRoutes from "./routes";
import ErrorBoundary from "./routes/ErrorPage/ErrorPage";

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </div>
  );
}

export default App;
