const asyncErrorWrapper = require("express-async-handler");
const Team = require("../../models/Team");
const User = require("../../models/User");
const CustomError = require("../../helpers/error/CustomError");

const isTeamLeaderOrAdmin = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    const [team, user] = await Promise.all([
        Team.findById(teamId),
        User.findById(userId)
    ]);

    if (!team) {
        return next(new CustomError("Team not found", 404));
    }

    if (!user) {
        return next(new CustomError("User not found", 404));
    }

    if (user.role !== "admin" && team.leader.toString() !== userId) {
        return next(new CustomError("You are not authorized to add members"));
    }

    next();
})

const isTeamMember = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);

    if (!team) {
        return next(new CustomError("Team not found", 404));
    }

    if (!team.members.includes(userId)) {
        return next(new CustomError("You are not a member of this team", 403));
    }

    next();
})

module.exports = {
    isTeamLeaderOrAdmin,
    isTeamMember
}