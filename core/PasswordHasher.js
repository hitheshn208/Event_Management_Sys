const bcrypt = require("bcrypt");

/** Hashes and verifies passwords. Existing hashes of any cost still verify. */
class PasswordHasher {
    #saltRounds;

    constructor(saltRounds = 10) {
        this.#saltRounds = saltRounds;
    }

    hash(plainText) {
        return bcrypt.hash(plainText, this.#saltRounds);
    }

    verify(plainText, hash) {
        return bcrypt.compare(plainText, hash);
    }
}

module.exports = PasswordHasher;
