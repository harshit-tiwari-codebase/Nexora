import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./app/app.routes";
import useAuth from "./features/auth/hooks/useAuth";

const App = () => {
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    getCurrentUser();
  }, []);
console.log("App rendered");
  return (
    <div className="min-h-screen bg-[#09090B]">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;