const express = require("express");
const { getAccessToRoute, getAdminAccess } = require("../middlewares/authorization/auth");
const { blockUser, deleteUser, toggleTeamStatus, getTeamStats } = require("../controllers/admin");
const { checkUserExist, checkTeamExist } = require("../middlewares/database/databaseErrorHelpers");
const router = express.Router();


router.use([getAccessToRoute, getAdminAccess]);
router.get("/block/:id", checkUserExist, blockUser);
router.delete("/user/:id", checkUserExist, deleteUser);
router.get("/team/toggle_status/:teamId", checkTeamExist, toggleTeamStatus);
router.get("/team/stats/:teamId", checkTeamExist, getTeamStats);

module.exports = router;