const express = require("express");
const { getSingleUser, getAllUsers } = require("../controllers/user.js");
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers.js");
const router = express.Router();

router.get("/", getAllUsers)
router.get("/:id", checkUserExist, getSingleUser);


module.exports = router;