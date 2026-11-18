const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const buildContainer = require("./container");
const authRoutes = require("./routes/authorizationRoute");
const studentRoutes = require("./routes/studentRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const errorHandler = require("./middleware/errorHandler");
const { UPLOADS_DIR } = require("./middleware/upload");
const { NotFoundError } = require("./core/errors");

const PORT = process.env.PORT || 3000;
const FRONTEND_DIST = path.join(__dirname, "frontend/dist");

// multer's diskStorage does not create the destination folder on its own.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const container = buildContainer();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log("Request : ", req.url, req.method);
    next();
});

//^ Uploaded event images
app.use("/uploads", express.static(UPLOADS_DIR));

//^ JSON API
app.use("/api/auth", authRoutes(container));
app.use("/api/student", container.requireRole("student"), studentRoutes(container));
app.use("/api/organization", container.requireRole("organization"), organizationRoutes(container));
app.use("/api", (req, res, next) => next(new NotFoundError("API route not found")));
app.use(errorHandler);

//^ React build (production). In development the Vite dev server serves the frontend.
if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
        res.sendFile(path.join(FRONTEND_DIST, "index.html"));
    });
}

app.listen(PORT, (e) => {
    if (e)
        console.log("Error while starting the server");
    else
        console.log(`Server is running in http://localhost:${PORT}`);
});
