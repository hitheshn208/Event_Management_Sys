const express = require("express");
const { showOrgDashboard } = require("../controllers/organizationController");

const orgRouter = express.Router()

orgRouter.get("/dashboard", showOrgDashboard);

module.exports = orgRouter;