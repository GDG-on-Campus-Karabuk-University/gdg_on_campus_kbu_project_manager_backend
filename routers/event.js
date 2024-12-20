const express = require("express");
const { getAccessToRoute } = require("../middlewares/authorization/auth.js");
const { isTeamLeaderOrAdmin, isTeamMember } = require("../middlewares/authorization/team.js");
const {
    createEvent,
    joinEvent,
    getSingleEvent,
    getAllEvents,
    leaveEvent,
    updateEvent,
    deleteEvent,
    getTeamEvents
} = require("../controllers/event");

const router = express.Router();

router.get("/", getAllEvents)
router.get("/:eventId", getSingleEvent);
router.use(getAccessToRoute);

// Open to all users

router.post("/:eventId/join", joinEvent);
router.delete("/:eventId/leave", leaveEvent);
router.get("/:teamId/events", getTeamEvents);


// Can be shortened like this on the account that there is a front end or mobile page.
// router.use("/:teamId", isTeamLeaderOrAdmin);

// Authorized personnel can access these routes
router.post("/:teamId/create", isTeamLeaderOrAdmin, createEvent);
router.put("/:teamId/:eventId/update", isTeamLeaderOrAdmin, updateEvent);
router.delete("/:teamId/:eventId/delete", isTeamLeaderOrAdmin, deleteEvent);

module.exports = router;