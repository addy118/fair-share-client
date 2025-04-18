import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "@/routes";
import AuthProvider from "./authProvider";
import { Toaster } from "./components/ui/sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <Toaster theme="light" position="bottom-right" />
      <RouterProvider router={router}>
        <AuthProvider />
      </RouterProvider>
    </>
  </StrictMode>
);
