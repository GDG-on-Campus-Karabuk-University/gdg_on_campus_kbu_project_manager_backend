const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const { sendJwtToClient } = require("../helpers/authorization/tokenHelpers");
const {
    validateUserInput,
    comparePassword
} = require("../helpers/input/inputHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");

const register = asyncErrorWrapper(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendJwtToClient(user, res);

});

const login = asyncErrorWrapper(async (req, res, next) => {

    const { email, password } = req.body;
    if (!validateUserInput(email, password)) {
        return next(new CustomError("Please check your input of mail and password", 400));
    };

    const user = await User.findOne({ email }).select("+password");

    if (!comparePassword(password, user.password)) {
        return next(new CustomError("Please check your credentials", 400));
    }

    sendJwtToClient(user, res);
});

const logout = asyncErrorWrapper(async (req, res, next) => {
    const { NODE_ENV } = process.env;

    /* The line below may cause problems, being contained "access_token", "" and
    on postman pm.environment.set("access_token", "none"), further research is advised!!!*/

    return res.status(200).cookie("access_token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: NODE_ENV === "development" ? false : true
    })
        .json({
            success: true,
            message: "Logout Successful"
        })
});

const imageUpload = asyncErrorWrapper(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        "profile_image": req.savedProfileImage
    }, {
        new: true,
        runValidators: true
    })

    res.status(200)
    .json({
        success: true,
        message: "Image Upload Successful",
        data: user
    })
})

const forgotPassword = asyncErrorWrapper(async (req, res, next) => {

    const resetEmail = req.body.email;

    const user = await User.findOne({email: resetEmail});

    if (!user) {
        return next(new CustomError("There is no user with that email", 400));
    }

    const resetPasswordToken = await user.getResetPasswordTokenFromUser();

    await user.save();

    console.log(resetPasswordToken);

    const resetPasswordUrl = `http:127.0.0.1:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

    const emailTemplate = `
        <h3>Reset Your Password</h3>
        <p> This <a href = '${resetPasswordUrl}' target = '_blank'>link</a> will expire in an hour</p>
    `

    try {
        await sendEmail({
            from: process.env.SMTP_USER,
            to: resetEmail,
            subject: "Reset Your Password",
            html: emailTemplate
        });

        return res.status(200)
        .json({
            success: true,
            message: "Token Sent to Your Email"
        })
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return next(new CustomError("Email Could Not Be Sent", 500));
    }
});

const resetPassword = asyncErrorWrapper(async (req, res, next) => {
    
    const {resetPasswordToken} = req.query;

    const {password} = req.body;

    if (!resetPasswordToken) {
        return next(new CustomError("Please provide a valid token", 400));
    }

    let user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {$gt : Date.now()}
    });

    if (!user) {
        return next(new CustomError("Invalid Token or Session Expired", 404));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200)
    .json({
        success: true,
        message: "Reset Password Process Successful"
    })
})

const getUser = (req, res, next) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            name: req.user.name
        }
    })
}

const editDetails = asyncErrorWrapper(async (req, res, next) => {
    const editInformation = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, editInformation, {
        new: true,
        runValidators: true
    });

    return res.status(200)
    .json({
        success: true,
        user
    })
})

module.exports = {
    register,
    login,
    getUser,
    logout,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
}