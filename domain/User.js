/**
 * Abstract base for everyone who can log in.
 * Subclasses decide their role, token identity, home page and public profile
 * (polymorphism); the password hash is private and never leaves the object.
 */
class User {
    #passwordHash;

    constructor({ name, email, passwordHash = null }) {
        if (new.target === User) {
            throw new TypeError("User is abstract");
        }
        this.name = name;
        this.email = email;
        this.#passwordHash = passwordHash;
    }

    /** @returns {"student"|"organization"} */
    get role() {
        throw new Error("abstract");
    }

    /** Value stored as `id` inside the auth token. */
    get tokenId() {
        throw new Error("abstract");
    }

    /** Where the frontend should send this user after logging in. */
    get homeRoute() {
        throw new Error("abstract");
    }

    /** Public fields safe to send to the browser. */
    toProfile() {
        throw new Error("abstract");
    }

    /** What GET /api/auth/me returns as `user`. */
    toSessionUser() {
        return this.toProfile();
    }

    /** @param {import("../core/PasswordHasher")} hasher */
    async checkPassword(plainText, hasher) {
        if (!this.#passwordHash || !plainText) return false;
        return hasher.verify(plainText, this.#passwordHash);
    }
}

module.exports = User;
