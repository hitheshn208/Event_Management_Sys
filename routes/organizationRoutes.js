const express = require("express");
const { upload } = require("../middleware/upload");

module.exports = function organizationRoutes({ organizationController: c }) {
    const router = express.Router();

    router.get("/dashboard", c.dashboard);
    router.get("/registrations", c.registrationOverview);
    router.get("/event/:eventId/registrations", c.eventRegistrations);
    router.post("/organise-event", upload.single("image"), c.createEvent);
    router.get("/event/:eventId/edit", c.editableEvent);
    router.put("/event/:eventId/edit", upload.single("image"), c.updateEvent);
    router.delete("/event/:eventId/delete", c.deleteEvent);

    return router;
};
