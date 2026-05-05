const express = require("express");
const {showDashboard} = require('../controllers/studentController')

const studentRouter = express.Router();

studentRouter.get("/dashboard", showDashboard);

module.exports = studentRouter;