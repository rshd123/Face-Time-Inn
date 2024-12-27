import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import connectToSocket from "./controllers/socketManager.js";
import { userRouter } from "./routes/userRouter.js";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = 3000;

const dbURL = "mongodb://localhost:27017/FaceTimeInn";

const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const start = async () => {
    try {
        await mongoose.connect(dbURL);
        console.log("Connected to DB");

        server.listen(PORT, () => {
            console.log(`APP IS LISTENING ON PORT ${PORT}`);
        });
    } catch (err) {
        console.error("Could not connect to DB", err);
    }
};

start();

app.use("/users",userRouter);
