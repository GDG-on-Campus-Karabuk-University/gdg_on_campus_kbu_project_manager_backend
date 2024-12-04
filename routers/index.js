const express = require("express");
const auth = require("./auth.js");
const user = require("./user.js");
const admin = require("./admin.js");
const team = require("./team.js");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/admin", admin);
router.use("/team", team);

module.exports = router;