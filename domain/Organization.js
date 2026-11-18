const User = require("./User");

class Organization extends User {
    constructor({ id = null, name, username, email, passwordHash = null }) {
        super({ name, email, passwordHash });
        this.id = id;
        this.username = username;
    }

    static fromRow(row) {
        return new Organization({
            id: row.id,
            name: row.name,
            username: row.username,
            email: row.email,
            passwordHash: row.password,
        });
    }

    get role() {
        return "organization";
    }

    get tokenId() {
        return this.id;
    }

    get homeRoute() {
        return "/organization/dashboard";
    }

    toProfile() {
        return { name: this.name, email: this.email, username: this.username };
    }

    toSessionUser() {
        return { id: this.id, ...this.toProfile() };
    }
}

module.exports = Organization;
