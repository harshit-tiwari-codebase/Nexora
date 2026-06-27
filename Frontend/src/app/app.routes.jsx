import { createBrowserRouter } from "react-router-dom";

import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Home from "../features/auth/pages/Home";
import Dashboard from "../features/chat/pages/Dashboard";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <Dashboard />,
      },
    ],
  },
]);

export default router;