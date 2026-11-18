const express = require("express");

module.exports = function authRoutes({ authController: c }) {
    const router = express.Router();

    router.get("/me", c.me);
    router.post("/student-login", c.loginStudent);
    router.post("/student-register", c.registerStudent);
    router.post("/organizer-login", c.loginOrganization);
    router.post("/organizer-register", c.registerOrganization);
    router.post("/logout", c.logout);

    return router;
};
