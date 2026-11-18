const BaseRepository = require("./BaseRepository");
const { ValidationError } = require("../core/errors");

class VenueRepository extends BaseRepository {
    /** Returns the venue with its database id, or throws if it doesn't exist. */
    async resolve(venue, client) {
        const row = await this.one("SELECT id FROM venue WHERE block = $1 AND hall = $2", [venue.block, venue.hall], client);
        if (!row) throw new ValidationError("Venue not found");
        return venue.withId(row.id);
    }
}

module.exports = VenueRepository;
