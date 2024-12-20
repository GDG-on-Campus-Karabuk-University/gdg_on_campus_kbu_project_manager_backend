const express = require("express");
const { createTeam, addMemberToTeam, removeMemberFromTeam, getSingleTeam, getAllTeams, updateTeamInfo } = require("../controllers/team.js");
const { getAccessToRoute } = require("../middlewares/authorization/auth.js");
const { checkTeamExist } = require("../middlewares/database/databaseErrorHelpers.js");
const { isTeamLeaderOrAdmin } = require("../middlewares/authorization/team.js");
const { uploadTeamProfilePic } = require("../controllers/team.js");
const upload = require("../middlewares/libraries/profileImageUpload.js");
const router = express.Router();

router.get("/", getAllTeams);
router.get("/:id", checkTeamExist, getSingleTeam);

router.use(getAccessToRoute);
router.post("/create", getAccessToRoute, createTeam);


router.put("/:teamId/update", getAccessToRoute, isTeamLeaderOrAdmin, updateTeamInfo);

// Rework
router.post("/:teamId/members", getAccessToRoute, isTeamLeaderOrAdmin, addMemberToTeam);

router.delete("/:teamId/members/:userId", getAccessToRoute, isTeamLeaderOrAdmin, removeMemberFromTeam);

router.post("/upload/:teamId", [getAccessToRoute, upload.single("team_image")], uploadTeamProfilePic);

module.exports = router;