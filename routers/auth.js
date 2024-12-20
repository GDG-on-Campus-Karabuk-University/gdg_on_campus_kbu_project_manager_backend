const express = require("express");
const path = require("path");
const { register, login, getUser, logout, imageUpload, forgotPassword, resetPassword, editDetails } = require("../controllers/auth");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const profileImageUpload = require("../middlewares/libraries/profileImageUpload");

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/profile", getAccessToRoute, getUser);
router.get("/logout", getAccessToRoute, logout);
router.post("/forgotpassword", forgotPassword);
router.get("/resetpassword", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/resetpasswordinterface.html"));
});
router.put("/resetpassword", resetPassword);
router.put("/edit", getAccessToRoute, editDetails);


router.post("/upload", [getAccessToRoute, profileImageUpload.single("profile_image")], imageUpload);


module.exports = router;