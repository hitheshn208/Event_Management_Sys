const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("./routes/authorizationRoute");
const studentRouter = require("./routes/studentRoutes");
const orgRouter = require("./routes/organizationRoutes");
const { auth, orgauth } = require("./middleware/authmiddleware");

const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, "public/uploads");
const FRONTEND_DIST = path.join(__dirname, "frontend/dist");

// multer's diskStorage does not create the destination folder on its own.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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
app.use("/api/auth", authRouter);
app.use("/api/student", auth, studentRouter);
app.use("/api/organization", orgauth, orgRouter);

app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

//^ JSON error responses (multer upload limits, malformed JSON bodies, ...)
app.use((err, req, res, next) => {
    console.log(err);
    if (res.headersSent)
        return next(err);
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : (err.status || err.statusCode || 500);
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 10MB or smaller" : (status < 500 ? err.message : "Internal server error");
    res.status(status).json({ message });
});

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
