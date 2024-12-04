const Team = require("../models/Team");
const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const createTeam = asyncErrorWrapper(async (req, res, next) => {
    const { name } = req.body;
    const leaderId = req.user.id;

    const existingTeam = await Team.findOne({ name });

    if (existingTeam) {
        return next(new CustomError("Team name is already in use", 400));
    }

    const leader = await User.findById(leaderId);

    if (!leader) {
        return next(new CustomError("No leader found with that name", 400));
    }

    if (leader.team) {
        return next(new CustomError("Leader already has a team", 400));
    }

    const team = await Team.create({ name, leader: leaderId });

    leader.team = team._id;

    await leader.save();

    res.status(200)
        .json({
            success: true,
            message: "Team has been successfully created",
            team
        });
})

const addMemberToTeam = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId).populate("members");

    if (!team) {
        return next(new CustomError("Team not found", 404));
    }

    const user = await User.findById(userId);

    if (!user) {
        return next(new CustomError("User not found", 404));
    }

    if (userId === req.user.id) {
        return next(new CustomError("You cannot add yourself to a team", 400));
    }

    if (user.team) {
        return next(new CustomError("User is already part of a team", 400));
    }

    if (team.members.length >= team.maxMembers) {
        return next(new CustomError("Team is full", 400));
    }

    team.members.push(userId);
    await team.save();

    user.team = teamId;
    await user.save();

    return res.status(200)
        .json({
            success: true,
            message: "Member successfully added to the team",
            team
        })
})

const removeMemberFromTeam = asyncErrorWrapper(async (req, res, next) => {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId).populate("members");
    const user = await User.findById(userId);

    if (!team) {
        return next(new CustomError("Team not found", 404));
    }

    if (!user) {
        return next(new CustomError("User not found", 404));
    }

    if (!team.members.some(member => member._id.toString() === userId.toString())) {
        return next(new CustomError("User is not in this team", 404));
    }
    
    team.members = team.members.filter(member => member._id.toString() !== userId.toString());

    user.team = null;

    await team.save();
    await user.save();

    return res.status(200)
    .json({
        success: true,
        message: "User successfully removed from the team"
    });
})

// Team Speculations can be directed to a new file

const getSingleTeam = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    const team = await Team.findById(id);

    return res.status(200)
        .json({
            success: true,
            team
        })
}) 

const getAllTeams = asyncErrorWrapper(async (req, res, next) => {
    const teams = await Team.find();

    return res.status(200)
        .json({
            success: true,
            teams
        })
})

module.exports = {
    createTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    getSingleTeam,
    getAllTeams
}