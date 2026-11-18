const express = require("express");
const {
	getDashboard,
	getMyRegistrations,
	getEventDetails,
	registerForEvent,
	cancelRegistration
} = require("../controllers/studentController");

const studentRouter = express.Router();

studentRouter.get("/dashboard", getDashboard);
studentRouter.get("/registrations", getMyRegistrations);
studentRouter.get("/event/:eventId", getEventDetails);
studentRouter.post("/event/:eventId/register", registerForEvent);
studentRouter.post("/event/:eventId/cancel", cancelRegistration);

module.exports = studentRouter;
