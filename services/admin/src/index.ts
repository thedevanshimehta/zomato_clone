import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app=express();
app.use(cors());
app.use("/api/v1",adminRoutes);

// app.use(express.json());
// app.use(cors());

app.listen(process.env.PORT,()=>{
    console.log(`Admin service is running on port ${process.env.PORT}`);
})