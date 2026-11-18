const Registration = require("./Registration");

/** A named group of students registering together (aggregation of USNs). */
class Team {
    constructor(name, memberUsns) {
        this.name = name;
        this.members = [...memberUsns];
    }

    get size() {
        return this.members.length;
    }

    toRegistrations(eventId) {
        return this.members.map((usn) => new Registration({ eventId, usn, teamName: this.name }));
    }
}

module.exports = Team;
