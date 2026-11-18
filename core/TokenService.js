const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Owns everything about the auth cookie: signing, verifying, and the cookie
 * options (previously duplicated between login and logout).
 */
class TokenService {
    #secret;
    #cookieOptions = { httpOnly: true, secure: false, sameSite: "lax" };

    constructor(secret = process.env.JWT_SECRET) {
        if (!secret) throw new Error("JWT_SECRET is not set");
        this.#secret = secret;
    }

    /** Issues a token for a domain User and stores it in the response cookie. */
    issue(res, user) {
        const token = jwt.sign({ id: user.tokenId, role: user.role }, this.#secret, { expiresIn: "7d" });
        res.cookie(COOKIE_NAME, token, { ...this.#cookieOptions, maxAge: MAX_AGE_MS });
    }

    clear(res) {
        res.clearCookie(COOKIE_NAME, this.#cookieOptions);
    }

    /** @returns {{id: string|number, role: string} | null} */
    read(req) {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) return null;
        try {
            return jwt.verify(token, this.#secret);
        } catch {
            return null;
        }
    }
}

module.exports = TokenService;
