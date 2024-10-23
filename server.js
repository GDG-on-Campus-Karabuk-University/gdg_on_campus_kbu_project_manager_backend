const express = require("express");

const app = express();

const PORT = 5000 || process.env.PORT;


app.get("/", (req, res) => {
    res.send("Hello GDG Backend API - UPDATED");
})
app.listen(PORT, () => {
    console.log(`App Started on ${PORT}`);
});