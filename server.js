const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./helpers/database/connectDatabase.js");
const customErrorHandler = require("./middlewares/errors/customErrorHandler.js");
const path = require("path");
const { createServer } = require("http");
const socketSetup = require("./socket.js");
const cors = require("cors");
const helmet = require("helmet");

const routers = require("./routers/index.js");

// Enviroment Variables

dotenv.config({
    path: "./config/env/config.env"
});


// MongoDb Connection

connectDatabase();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.socket.io"],
            connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'", "https:", "data:"],
        },
    },
}));

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO'nun yapılandırmasını burada başlatıyoruz

socketSetup(io);

// Express - Body Middleware;

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routers Middleware

app.use("/api", routers);

// Error Handler

app.use(customErrorHandler);

// Static Files

app.use(express.static(path.join(__dirname, "public")));


httpServer.listen(PORT, () => {
    console.log(`App Started on ${PORT} : ${process.env.NODE_ENV}`);
});