const BaseRepository = require("./BaseRepository");
const Organization = require("../domain/Organization");

class OrganizationRepository extends BaseRepository {
    /** @returns {Promise<Organization|null>} including the password hash */
    async findByUsername(username) {
        const row = await this.one("SELECT * FROM organization WHERE username = $1", [username]);
        return row ? Organization.fromRow(row) : null;
    }

    async existsByUsernameOrName(username, name) {
        const row = await this.one("SELECT 1 FROM organization WHERE username = $1 OR name = $2", [username, name]);
        return row !== null;
    }

    getProfile(id) {
        return this.one("SELECT name, email, username FROM organization WHERE id = $1", [id]);
    }

    async create(organization, passwordHash) {
        const row = await this.one(
            "INSERT INTO organization (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
            [organization.name, organization.username, organization.email, passwordHash]
        );
        organization.id = row.id;
        return organization;
    }
}

module.exports = OrganizationRepository;
