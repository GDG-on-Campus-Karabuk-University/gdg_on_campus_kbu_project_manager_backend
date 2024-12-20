const Event = require("../models/Event");
const Team = require("../models/Team");
const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const createEvent = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;
    const { title, description, startDate, endDate, location, eventType } = req.body;

    const existingEvent = await Event.findOne({ title });

    if (existingEvent) {
        return next(new CustomError("Event name is already in use", 400));
    }

    const team = await Team.findById(teamId);

    if (!team) {
        return next(new CustomError("Team not found", 404));
    }

    const event = await Event.create({
        title,
        description,
        startDate,
        endDate,
        location,
        eventType
    });

    // OR CLUB ID, waiting to be added

    event.team = team._id;

    await event.save();

    return res.status(200).json({
        success: true,
        message: "Event has been successfully created",
        event
    });
})

const joinEvent = asyncErrorWrapper(async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
        return next(new CustomError("Event not found", 404));
    }

    if (event.participants.includes(req.user.id)) {
        return next(new CustomError("Zaten bu etkinliğe katıldınız", 400));
    }

    event.participants.push(userId);

    await event.save();

    return res.status(200).json({
        success: true,
        message: "You are added to the event",
        event
    });
})

const leaveEvent = asyncErrorWrapper(async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
        return next(new CustomError("Event not found", 404));
    }

    if (!event.participants.includes(req.user.id)) {
        return next(new CustomError("Bu etkinliğe zaten katılmıyorsunuz", 400));
    }

    event.participants = event.participants.filter(participant => participant.toString() !== req.user.id);

    await event.save();

    return res.status(200).json({
        success: true,
        message: "You are removed from the event",
        event
    });
})

const updateEvent = asyncErrorWrapper(async (req, res, next) => {
    const { eventId } = req.params;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(
        eventId,
        updateData,
        {
            new: true,
            runValidators: true
        });

    return res.status(200).json({
        success: true,
        message: "Event has been successfully updated",
        event
    });
})

const deleteEvent = asyncErrorWrapper(async (req, res, next) => {
    const { eventId } = req.params;

    await Event.findByIdAndDelete(eventId);

    return res.status(200).json({
        success: true,
        message: "Event has been successfully deleted"
    });
})

const getSingleEvent = asyncErrorWrapper(async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    return res.status(200).json({
        success: true,
        event
    });
})

const getAllEvents = asyncErrorWrapper(async (req, res, next) => {
    const events = await Event.find();

    return res.status(200).json({
        success: true,
        events
    });
})

// The function below should be checked if it is working properly.

const getTeamEvents = asyncErrorWrapper(async (req, res, next) => {
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { team: teamId };

    if (startDate && endDate) {
        query.startDate = { $gte: startDate, $lte: endDate };
        query.endDate = { $lte: startDate, $lte: endDate };
    }

    const events = await Event.find(query)
        .populate("participants", "name email")
        .sort({ startDate: 1 });

    return res.status(200).json({
        success: true,
        events
    });
})

module.exports = {
    createEvent,
    joinEvent,
    leaveEvent,
    updateEvent,
    deleteEvent,
    getSingleEvent,
    getAllEvents,
    getTeamEvents
}