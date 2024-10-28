const express = require("express");
const auth = require("./auth.js");
const user = require("./user.js");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);

module.exports = router;