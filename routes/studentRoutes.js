const express = require("express");
const {
	showDashboard,
	showMyRegistrationsPage,
	showEventDetailsPage,
	showEventRegistrationPage,
	registerForEvent,
	cancelRegistration
} = require("../controllers/studentController");

const studentRouter = express.Router();

studentRouter.get("/dashboard", showDashboard);
studentRouter.get("/registrations", showMyRegistrationsPage);
studentRouter.get("/event/:eventId", showEventDetailsPage);
studentRouter.get("/event/:eventId/register", showEventRegistrationPage);
studentRouter.post("/event/:eventId/register", registerForEvent);
studentRouter.post("/event/:eventId/cancel", cancelRegistration);

module.exports = studentRouter;