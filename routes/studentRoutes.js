const express = require("express");

module.exports = function studentRoutes({ studentController: c }) {
    const router = express.Router();

    router.get("/dashboard", c.dashboard);
    router.get("/registrations", c.myRegistrations);
    router.get("/event/:eventId", c.eventDetails);
    router.post("/event/:eventId/register", c.register);
    router.post("/event/:eventId/cancel", c.cancel);

    return router;
};
