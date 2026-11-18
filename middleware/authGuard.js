const { AuthenticationError, ForbiddenError } = require("../core/errors");

/** Builds middleware that only lets a logged-in user with `role` through. */
module.exports = function createAuthGuard(tokenService) {
    return function requireRole(role) {
        return (req, res, next) => {
            const payload = tokenService.read(req);
            if (!payload) return next(new AuthenticationError("Please log in to continue"));
            if (payload.role !== role) return next(new ForbiddenError(`This area is only for ${role} accounts`));
            req.user = payload;
            next();
        };
    };
};
