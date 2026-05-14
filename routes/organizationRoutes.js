const express = require("express");
const { showOrgDashboard, showOrganiseEvent } = require("../controllers/organizationController");

const orgRouter = express.Router()

orgRouter.get("/dashboard", showOrgDashboard);
orgRouter.get("/organise-event", showOrganiseEvent)

module.exports = orgRouter;