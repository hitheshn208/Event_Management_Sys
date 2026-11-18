const { AppError } = require("../core/errors");

/**
 * The single place that turns errors into HTTP responses.
 * Express 5 forwards errors thrown in async handlers here automatically.
 */
module.exports = function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err instanceof AppError) {
        return res.status(err.status).json({ message: err.message });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Image must be 10MB or smaller" });
    }
    // body-parser / multer client errors carry their own 4xx status
    const status = err.status || err.statusCode;
    if (status >= 400 && status < 500) {
        return res.status(status).json({ message: err.message });
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
};
