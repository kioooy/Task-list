import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";

import TodoApp from "./Todo-list/index.tsx";

// document.getElementById('root')
// 1. Tìm tới root
// 2. Lấy code ở trong App gắn vào root

const router = createBrowserRouter([
  {
    path: "/",
    element: <TodoApp />,
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
} else {
  console.error("Root element not found");
}

// Single Page Application
// client side rendering
// SEO
