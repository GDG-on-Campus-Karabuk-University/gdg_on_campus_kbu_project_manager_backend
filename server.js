const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./helpers/database/connectDatabase.js");
const customErrorHandler = require("./middlewares/errors/customErrorHandler.js");
const path = require("path");


const routers = require("./routers/index.js")

// Enviroment Variables

dotenv.config({
    path: "./config/env/config.env"
});


// MongoDb Connection

connectDatabase();

const app = express();

// Express - Body Middleware;

app.use(express.json());

const PORT = process.env.PORT;

// Routers Middleware

app.use("/api", routers);

// Error Handler

app.use(customErrorHandler);

// Static Files

app.use(express.static(path.join(__dirname, "public")));


app.listen(PORT, () => {
    console.log(`App Started on ${PORT} : ${process.env.NODE_ENV}`);
});