import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Global error handler for ZXing translateDisabled error
window.addEventListener("error", (event) => {
  if (
    event.error &&
    event.error.message &&
    event.error.message.includes("translateDisabled")
  ) {
    console.warn(
      "ZXing translateDisabled error caught and suppressed:",
      event.error
    );
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes("translateDisabled")
  ) {
    console.warn(
      "ZXing translateDisabled promise rejection caught and suppressed:",
      event.reason
    );
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
