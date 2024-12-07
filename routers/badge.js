const express = require("express");
const { addBadgeToUser, removeBadgeFromUser } = require("../controllers/team");
const { getAccessToRoute } = require("../middlewares/authorization/auth");

const router = express.Router();

router.post("/:userId/add-badge", getAccessToRoute, addBadgeToUser);
router.delete("/:userId/remove-badge", getAccessToRoute, removeBadgeFromUser);

module.exports = router;