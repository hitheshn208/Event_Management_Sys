const express = require("express");
const path = require("path");
const multer = require("multer");
const { customAlphabet } = require("nanoid");
const { showOrgDashboard, showOrganiseEvent, createEvent } = require("../controllers/organizationController");

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
const orgRouter = express.Router({})

orgRouter.get("/dashboard", showOrgDashboard);
orgRouter.get("/organise-event", showOrganiseEvent);
orgRouter.post("/organise-event", upload.single("image"), createEvent);

module.exports = orgRouter;