const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path : path.join(__dirname, "../.env")})

// Returns the decoded token payload, or null if the cookie is missing/invalid.
const decodeToken = (req) => {
    const token = req.cookies.token;
    if (!token)
        return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return null;
    }
};

const requireRole = (role) => (req, res, next) => {
    const decoded = decodeToken(req);

    if (!decoded)
        return res.status(401).json({ message: "Please log in to continue" });

    if (decoded.role !== role)
        return res.status(403).json({ message: `This area is only for ${role} accounts` });

    req.user = decoded;
    next();
};

exports.decodeToken = decodeToken;
exports.auth = requireRole("student");
exports.orgauth = requireRole("organization");
