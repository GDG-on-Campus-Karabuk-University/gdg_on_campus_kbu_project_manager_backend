const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const register = asyncErrorWrapper(async (req, res, next) => {

    const name = "Emirhan Soylu";
    const email = "emosan12@gmail.com";
    const password = "123456";

    const user = await User.create({
        name,
        email,
        password
    });

    res.status(200)
    .json({
            user
    });

});

const errorTest = (req, res, next) => {

    return next(new TypeError("Type Error"));

}

module.exports = {
    register,
    errorTest
}