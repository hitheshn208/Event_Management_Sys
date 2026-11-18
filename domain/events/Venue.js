/** A hall inside a campus block. Identified in forms by (block, hall). */
class Venue {
    constructor({ id = null, block, hall }) {
        this.id = id;
        this.block = block;
        this.hall = hall;
    }

    withId(id) {
        return new Venue({ id, block: this.block, hall: this.hall });
    }
}

module.exports = Venue;
