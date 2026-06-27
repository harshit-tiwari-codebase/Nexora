import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/geist-sans"
import "./index.css";
import App from "./App";
import {Provider} from "react-redux"
import { store } from "./app/app.store";

createRoot(document.getElementById("root")).render(

    <Provider store={store}>
        <App />
    </Provider>
   
 
);