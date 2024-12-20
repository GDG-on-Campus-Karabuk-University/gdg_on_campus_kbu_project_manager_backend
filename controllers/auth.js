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

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password
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

    const user = await User.findOne({ email: resetEmail });

    if (!user) {
        return next(new CustomError("There is no user with that email", 400));
    }

    const resetPasswordToken = await user.getResetPasswordTokenFromUser();

    await user.save();

    console.log(resetPasswordToken);

    const resetPasswordUrl = `http://127.0.0.1:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Şifre Sıfırlama</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4A90E2;
            margin-bottom: 10px;
        }
        .title {
            color: #2c3e50;
            font-size: 22px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 25px;
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4A90E2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
        }
        .warning {
            font-size: 13px;
            color: #666;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🔐 Güvenlik Bildirimi</div>
        </div>
        
        <div class="title">Şifre Sıfırlama Talebi</div>
        
        <div class="content">
            <p>Merhaba,</p>
            <p>Hesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi sıfırlamak için aşağıdaki butona tıklayabilirsiniz:</p>
        </div>
        
        <div style="text-align: center;">
            <a href="${resetPasswordUrl}" class="button" target="_blank">Şifremi Sıfırla</a>
        </div>
        
        <div class="warning">
            <p>⚠️ Bu link 1 saat süreyle geçerlidir ve yalnızca bir kez kullanılabilir.</p>
            <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        
        <div class="footer">
            <p>Bu otomatik bir e-postadır, lütfen yanıtlamayınız.</p>
            <p>© ${new Date().getFullYear()} Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>
`;

    try {
        await sendEmail({
            from: process.env.SMTP_USER,
            to: resetEmail,
            subject: "Şifre Sıfırlama",
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

    const { resetPasswordToken } = req.query;

    const { password } = req.body;

    if (!resetPasswordToken) {
        return next(new CustomError("Please provide a valid token", 400));
    }

    let user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
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