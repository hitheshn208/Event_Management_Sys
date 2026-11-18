/**
 * Association class between Student and Event (the `participate` table).
 * Team members each get one Registration sharing the same teamName.
 */
class Registration {
    constructor({ eventId, usn, teamName = null }) {
        this.eventId = eventId;
        this.usn = String(usn);
        this.teamName = teamName;
    }
}

module.exports = Registration;
