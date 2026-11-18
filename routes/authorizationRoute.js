const express = require("express");
const { getCurrentUser, logoutUser, registerStudent, loginStudent, registerOrg, loginOrg } = require("../controllers/authorizationControllers");
const authRouter = express.Router();

authRouter.get("/me", getCurrentUser);

authRouter.post("/student-login", loginStudent);
authRouter.post("/organizer-login", loginOrg);
authRouter.post("/student-register", registerStudent);
authRouter.post("/organizer-register", registerOrg);
authRouter.post("/logout", logoutUser);

module.exports = authRouter;
