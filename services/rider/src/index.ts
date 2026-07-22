import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import riderRoutes from "./router/rider.js";
import cors from "cors";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/order.consumer.js";

dotenv.config();

await connectRabbitMQ();
startOrderReadyConsumer();

const app=express();

app.use(express.json());
app.use(cors());

app.use("/api/rider",riderRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Rider Service is running on port ${process.env.PORT}`);
    connectDB();
})