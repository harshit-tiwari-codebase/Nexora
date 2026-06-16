import express from "express"


const app = express();


app.get("/",(req , res)=>{
    res.send("hello from Nexora server");
})

export default app;