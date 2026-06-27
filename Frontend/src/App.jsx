import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./app/app.routes";

const App = () => {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Context Providers, ThemeProvider, etc. can go here */}
      <RouterProvider router={router} />
    </div>
  );
};

export default App;