const express = require("express");
const { createTeam, addMemberToTeam, removeMemberFromTeam, getSingleTeam, getAllTeams } = require("../controllers/team.js");
const { getAccessToRoute } = require("../middlewares/authorization/auth.js");
const { checkTeamExist } = require("../middlewares/database/databaseErrorHelpers.js");
const { isTeamLeaderOrAdmin } = require("../middlewares/authorization/teamAuth.js");
const router = express.Router();

router.get("/", getAllTeams);
router.get("/:id", checkTeamExist, getSingleTeam);
router.post("/create", getAccessToRoute, createTeam);

// Rework
router.post("/:teamId/members", getAccessToRoute, isTeamLeaderOrAdmin, addMemberToTeam);

router.delete("/:teamId/members/:userId", getAccessToRoute, isTeamLeaderOrAdmin, removeMemberFromTeam);

module.exports = router;