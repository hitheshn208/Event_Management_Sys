const { AuthenticationError } = require("../core/errors");

/**
 * HTTP adapter for AuthService: reads the request, calls the service,
 * sets/clears the cookie and shapes the JSON. No business rules here.
 */
class AuthController {
    #auth;
    #tokens;

    constructor({ authService, tokenService }) {
        this.#auth = authService;
        this.#tokens = tokenService;
    }

    me = async (req, res) => {
        const payload = this.#tokens.read(req);
        if (!payload) throw new AuthenticationError("Not logged in");

        const session = await this.#auth.getSession(payload);
        if (!session) {
            // Token is valid but the account no longer exists.
            this.#tokens.clear(res);
            throw new AuthenticationError("Not logged in");
        }
        res.json(session);
    };

    registerStudent = async (req, res) => {
        this.#signIn(res, await this.#auth.registerStudent(req.body), "Successfully Registered");
    };

    loginStudent = async (req, res) => {
        this.#signIn(res, await this.#auth.loginStudent(req.body), "Login successful");
    };

    registerOrganization = async (req, res) => {
        this.#signIn(res, await this.#auth.registerOrganization(req.body), "Successfully Registered");
    };

    loginOrganization = async (req, res) => {
        this.#signIn(res, await this.#auth.loginOrganization(req.body), "Login successful");
    };

    logout = (req, res) => {
        this.#tokens.clear(res);
        res.json({ message: "Logged out", redirecturl: "/" });
    };

    /** Same response for every successful sign-up/login; `user.homeRoute` is polymorphic. */
    #signIn(res, user, message) {
        this.#tokens.issue(res, user);
        res.json({ message, redirecturl: user.homeRoute });
    }
}

module.exports = AuthController;
