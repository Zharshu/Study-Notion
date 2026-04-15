import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import rootReducer from "./reducer";
import { configureStore } from "@reduxjs/toolkit";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import store from "./store/index";

// Suppress ResizeObserver loop errors (harmless warning from ProgressBar component)
const resizeObserverLoopErr =
  /ResizeObserver loop completed with undelivered notifications/;
const consoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && resizeObserverLoopErr.test(args[0])) {
    return;
  }
  consoleError(...args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
);
