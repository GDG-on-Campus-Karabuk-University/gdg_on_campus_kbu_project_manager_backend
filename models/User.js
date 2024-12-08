const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const UserSchema = new Schema({

    name: {
        type: String,
        required: [true, "Please provide a name"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "Please provide a valid email"
        ]
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "moderator", "editor", "contributor", "super_admin", "support_staff", "guest", "vip", "trainer", "team_leader", "auditor", "analyst", "developer", "tester"]
    },
    password: {
        type: String,
        minlength: [6, "Please provide a password with min length of 6"],
        required: [true, "Please provide a password"],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        maxlength: [50, "Title cannot exceed 50 characters"],
        default: "New User"
    },
    about: {
        type: String,
        maxlength: [500, "About section cannot exceed 500 characters"],
        default: "This user hasn't written anything about themselves yet."
    },
    place: {
        type: String,
        default: "Unknown",
        maxlength: [100, "Place cannot exceed 100 characters"]
    },
    website: {
        type: String,
        match: [/^(https?:\/\/)?([\w\-]+)\.([a-z]{2,6}\.?)(\/[\w\-]*)*\/?$/,
            "Please provide a valid URL"],
        default: null
    },
    profile_image: {
        type: String,
        default: "default.jpg"
    },
    blocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null,
        index: true
    },
    bio: {
        type: String,
        maxlength: [1000, "Biography cannot exceed 1000 characters"],
        default: "No biograph provided"
    },
    skills: {
        type: [String],
        validate: [arr => arr.length <= 10, "Skills cannot exceed 10 items"],
        default: []
    },
    social_links: {
        twitter: {
            type: String,
            match: [
                /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}$/,
                "Please provide a valid Twitter URL"
            ],
            default: null
        },
        linkedin: {
            type: String,
            match: [
                /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}$/,
                "Please provide a valid Twitter URL"
            ],
            default: null
        },
        github: {
            type: String,
            match: [
                /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}$/,
                "Please provide a valid Twitter URL"
            ],
            default: null
        },
    },
    interests: {
        type: [String],
        validate: [arr => arr.length <= 10, "Skills cannot exceed 10 items"],
        default: []
    },
    // date_of_birth: {
    //     type: Date,
    //     validate: {
    //         validator: function(value) {
    //             const today = new Date();
    //             const age = today.getFullYear() - value.getFullYear();
    //             return age >= 13;
    //         },
    //         message: "User must be at least 13 years old"
    //     },
    //     default: null
    // },
    phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
        default: null
    },
    badges: {
        type: [
            {
                name: { type: String, required: true },
                type: { type: String, required: true, enum: ["team", "club", "leader", "special"] },
                icon: { type: String, default: "default_badge.png" },
                issuedAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    }
})

UserSchema.methods.generateJwtFromUser = function () {

    const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

    const payload = {
        id: this._id,
        name: this.name
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRE
    });

    return token;
}

UserSchema.methods.getResetPasswordTokenFromUser = function () {
    const randomHexString = crypto.randomBytes(15).toString("hex");
    const { RESET_PASSWORD_EXPIRE } = process.env;

    const resetPasswordToken = crypto
        .createHash("SHA256")
        .update(randomHexString)
        .digest("hex");

    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);

    return resetPasswordToken;
}

UserSchema.pre("save", function (next) {

    if (!this.isModified("password")) {
        next();
    }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) next(err);

        bcrypt.hash(this.password, salt, (err, hash) => {
            // Store hash in your password DB.
            if (err) next(err);
            this.password = hash;
            next();
        })
    })
})

module.exports = mongoose.model("User", UserSchema);