import dotenv from "dotenv";
dotenv.config();

console.log("SERVER USER:", process.env.GOOGLE_USER);

import app from "./src/app.js";
import connectToDB from "./src/config/database.js";


const PORT = process.env.PORT || 3000;
connectToDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});