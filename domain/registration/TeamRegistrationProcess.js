const RegistrationProcess = require("./RegistrationProcess");
const Team = require("./Team");
const { ValidationError } = require("../../core/errors");

class TeamRegistrationProcess extends RegistrationProcess {
    resolveTeamName(input) {
        const name = String(input?.teamName ?? "").trim();
        if (!name) {
            throw new ValidationError("Team name is required for team events.");
        }
        return name;
    }

    buildRegistrations(memberUsns, teamName) {
        return new Team(teamName, memberUsns).toRegistrations(this.event.id);
    }
}

module.exports = TeamRegistrationProcess;
