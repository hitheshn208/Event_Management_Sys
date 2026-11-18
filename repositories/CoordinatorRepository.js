const BaseRepository = require("./BaseRepository");

class CoordinatorRepository extends BaseRepository {
    async insertMany(eventId, coordinators, client) {
        if (!coordinators.length) return;
        const values = [];
        const placeholders = coordinators.map((c, i) => {
            values.push(eventId, c.name, c.phone, c.email);
            const b = i * 4;
            return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4})`;
        });
        await this.run(`INSERT INTO coordinator (eventid, name, phone, email) VALUES ${placeholders.join(", ")}`, values, client);
    }

    async replaceAll(eventId, coordinators, client) {
        await this.run("DELETE FROM coordinator WHERE eventid = $1", [eventId], client);
        await this.insertMany(eventId, coordinators, client);
    }
}

module.exports = CoordinatorRepository;
