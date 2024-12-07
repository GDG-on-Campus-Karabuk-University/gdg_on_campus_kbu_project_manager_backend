const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TeamSchema = new Schema({

    teamName: {
        type: String,
        required: true,
        unique: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    maxMembers: {
        type: Number,
        default: 10
    },
    description: {
        type: String,
        default: ""
    },
    projects: [{
        title: {
            type: String,
            required: true
        },
        details: {
            type: String
        }
    }],
    team_image: {
        type: String,
        default: "default.png"
    }
    // Advisors, rel to organizations and school groups
})

module.exports = mongoose.model("Team", TeamSchema);