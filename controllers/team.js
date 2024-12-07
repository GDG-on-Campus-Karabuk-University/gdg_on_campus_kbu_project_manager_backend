const Team = require("../models/Team");
const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const createTeam = asyncErrorWrapper(async (req, res, next) => {
    const { teamName, leaderId, ...optionalFields } = req.body;

    const existingTeam = await Team.findOne({ teamName });

    if (existingTeam) {
        return next(new CustomError("Team name is already in use", 400));
    }

    const leader = await User.findById(leaderId);

    if (!leader) {
        return next(new CustomError("No leader found with that name", 400));
    }

    // console.log(leader, leader.team)

    if (leader.team) {
        return next(new CustomError("Leader already has a team", 400));
    }

    const team = await Team.create({
        teamName,
        leader: leaderId,
        ...optionalFields
    });

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

    const teamBadge = {
        name: `Member of ${team.name}`,
        type: "team",
        icon: "team_member_badge.png"
    };

    user.badges.push(teamBadge);
    await user.save();

    return res.status(200)
        .json({
            success: true,
            message: "Member successfully added to the team and given a badge",
            team,
            teamBadge
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

    const teamBadgeIndex = user.badges.findIndex(
        badge => badge.name === `Member of ${team.name}`
    );

    if (teamBadgeIndex !== -1) {
        user.badges.splice(teamBadgeIndex, 1);
    }

    await team.save();
    await user.save();

    return res.status(200)
        .json({
            success: true,
            message: "User successfully removed from the team",
            user
        });
})

const uploadTeamProfilePic = asyncErrorWrapper(async (req, res, next) => {

    const team = await Team.findByIdAndUpdate(req.params.teamId, {
        "team_image": req.savedProfileImage
    }, {
        new: true,
        runValidators: true
    })

    res.status(200)
        .json({
            success: true,
            message: "Team Picture Upload Successful",
            data: team
        })
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

const updateTeamInfo = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;
    const { description, projects } = req.body;

    const team = await Team.findByIdAndUpdate(
        teamId,
        {
            ...(description && { description }),
            ...(projects && { projects }),
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!team) {
        return next(new CustomError("Team not found", 404));
    }

    res.status(200)
        .json({
            success: true,
            message: "Team Updated Successfully",
            data: team
        })
})

// addBadgeToUser fonksiyonunda yalnızca speacial tipteki rozetler kullanılmalıdır!!!
const addBadgeToUser = asyncErrorWrapper(async (req, res, next) => {
    const { userId } = req.params;
    const { name, type, icon } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return next(new CustomError("User not found", 404));
    }

    const existingBadge = user.badges.find((badge) => badge.name === badgeName);
    if (existingBadge) {
        return next(new CustomError("This badge is already assigned to the user", 400));
    }

    if (!name || !type || !icon) {
        return next(new CustomError("Badge details are incomplete", 400));
    }

    const badge = {
        name,
        type,
        icon
    }

    user.badges.push(badge);
    await user.save();

    return res.status(200)
        .json({
            success: true,
            message: `${name} badge is successfully added to the user`,
            badge
        })
})

const removeBadgeFromUser = asyncErrorWrapper(async (req, res, next) => {
    const { userId } = req.params;
    const { badgeName } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return next(new CustomError("User not found", 404));
    }

    const badgeIndex = user.badges.findIndex((badge) => badge.name === badgeName);

    if (badgeIndex === -1) {
        return next(new CustomError("Badge not found on this user", 404));
    }

    user.badges.splice(badgeIndex, 1);
    await user.save();

    return res.status(200)
        .json({
            success: true,
            message: "Badge successfully removed from this user",
            badges: user.badges
        })
})

module.exports = {
    createTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    uploadTeamProfilePic,
    getSingleTeam,
    getAllTeams,
    updateTeamInfo,
    addBadgeToUser,
    removeBadgeFromUser
}