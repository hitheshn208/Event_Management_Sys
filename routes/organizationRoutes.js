const express = require("express");
const multer = require("multer");
const { showOrgDashboard, showOrganiseEvent, createEvent } = require("../controllers/organizationController");

const upload = multer();
const orgRouter = express.Router({})

orgRouter.get("/dashboard", showOrgDashboard);
orgRouter.get("/organise-event", showOrganiseEvent);
orgRouter.post("/organise-event", upload.array("images"), createEvent);

module.exports = orgRouter;