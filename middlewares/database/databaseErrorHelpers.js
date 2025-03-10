const User = require("../../models/User");
const Team = require("../../models/Team");
const CustomError = require("../../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const checkUserExist = asyncErrorWrapper(async (req, res, next) => {

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        return next(new CustomError("There is no such user with that id", 400));
    }

    // req.data = user;

    next();

})

const checkTeamExist = asyncErrorWrapper(async (req, res, next) => {

    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
        return next(new CustomError("There is no such team with that id", 400));
    }

    next();
})

module.exports = {
    checkUserExist,
    checkTeamExist
}