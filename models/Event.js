const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const EventSchema = new Schema({
    
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    location: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: ["meeting", "deadline", "presentation", "other"],
        default: "other"
    }

})

module.exports = mongoose.model("Event", EventSchema);