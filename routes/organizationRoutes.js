const express = require("express");
const path = require("path");
const multer = require("multer");
const { customAlphabet } = require("nanoid");
const { getOrgDashboard, getAllEventRegistrations, getEventRegistrations, createEvent, getEventForEdit, updateEvent, deleteEvent } = require("../controllers/organizationController");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890", 6);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + nanoid() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const orgRouter = express.Router({ mergeParams: true });

orgRouter.get("/dashboard", getOrgDashboard);
orgRouter.get("/registrations", getAllEventRegistrations);
orgRouter.get("/event/:eventId/registrations", getEventRegistrations);
orgRouter.post("/organise-event", upload.single("image"), createEvent);
orgRouter.get("/event/:eventId/edit", getEventForEdit);
orgRouter.put("/event/:eventId/edit", upload.single("image"), updateEvent);
orgRouter.delete("/event/:code/delete", deleteEvent);

module.exports = orgRouter;
