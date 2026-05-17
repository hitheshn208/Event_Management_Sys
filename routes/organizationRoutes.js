const express = require("express");
const path = require("path");
const multer = require("multer");
const { customAlphabet } = require("nanoid");
const { showOrgDashboard, showAllEventRegistrationsPage, showOrganiseEvent, showEventRegistrationsPage, createEvent, editEvent, updateEvent, deleteEvent} = require("../controllers/organizationController");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890", 6);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + nanoid() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
const orgRouter = express.Router({ mergeParams: true });

orgRouter.get("/dashboard", showOrgDashboard);
orgRouter.get("/organise-event", showOrganiseEvent);
orgRouter.get("/registrations", showAllEventRegistrationsPage);
orgRouter.get("/event/:eventId/registrations", showEventRegistrationsPage);
orgRouter.post("/organise-event", upload.single("image"), createEvent);
orgRouter.get("/event/:eventId/edit", editEvent);
orgRouter.put("/event/:eventId/edit", upload.single("image"), updateEvent);
orgRouter.delete("/event/:code/delete", deleteEvent);

module.exports = orgRouter;