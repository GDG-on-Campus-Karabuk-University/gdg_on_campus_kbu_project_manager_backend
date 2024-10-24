const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./helpers/database/connectDatabase.js");
const customErrorHandler = require("./middlewares/errors/customErrorHandler.js");
const routers = require("./routers/index.js")

// Enviroment Variables

dotenv.config({
    path : "./config/env/config.env"
});


// MongoDb Connection

connectDatabase();

const app = express();

const PORT = process.env.PORT;

// Routers Middleware

app.use("/api", routers);

// Error Handler

app.use(customErrorHandler);


app.listen(PORT, () => {
    console.log(`App Started on ${PORT} : ${process.env.NODE_ENV}`);
});