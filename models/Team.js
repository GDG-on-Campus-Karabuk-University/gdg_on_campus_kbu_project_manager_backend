const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TeamSchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    maxMembers: {
        type: Number,
        default: 10
    }
})

module.exports = mongoose.model("Team", TeamSchema);