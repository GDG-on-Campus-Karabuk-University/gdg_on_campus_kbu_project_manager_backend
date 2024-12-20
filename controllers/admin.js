const User = require("../models/User");
const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/error/CustomError");
const Team = require("../models/Team");

const blockUser = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    user.blocked = !user.blocked;
    
    await user.save();

    return res.status(200)
    .json({
        success: true,
        message: "Block - Unblock Successful"
    })
});

const deleteUser = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    await user.deleteOne();

    return res.status(200)
    .json({
        success: true,
        message: "User delete operation successful"
    })
});

const toggleTeamStatus = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    team.isActive = !team.isActive;

    await team.save();

    res.status(200)
    .json({
        success: true,
        message: `Team sitations is changed to ${team.isActive ? "active" : "archived"}`,
        data: team
    })
});

const getTeamStats = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;

    const stats = await Team.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(teamId) }},
        { $project: {
            memberCount: { $size: "$members"},
            projectCount: { $size: "$projects"},
            lastActivityDate: { $max: "$projects.createdAt"}
        }}
    ])

    res.status(200)
    .json({
        success: true,
        data: stats[0]
    })
})

module.exports = {
    blockUser,
    deleteUser,
    toggleTeamStatus,
    getTeamStats
};