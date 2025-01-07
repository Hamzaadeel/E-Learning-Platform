import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./config/firebase"; // Import firebase config to ensure initialization

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
