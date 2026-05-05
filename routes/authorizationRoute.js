const express = require("express");
const {showStudentLoginPage, showOrgLoginPage, showStudentRegisterPage, showOrgRegisterPage, registerStudent, loginStudent, registerOrg, loginOrg} = require("../controllers/authorizationControllers");
const authRouter = express.Router({ });

authRouter.get("/student-login", showStudentLoginPage);
authRouter.get("/organizer-login", showOrgLoginPage);
authRouter.get("/student-register", showStudentRegisterPage);
authRouter.get("/organizer-register", showOrgRegisterPage);

authRouter.post("/student-login", loginStudent);
authRouter.post("/organizer-login", loginOrg);
authRouter.post("/student-register", registerStudent)
authRouter.post("/organizer-register", registerOrg);


module.exports = authRouter;