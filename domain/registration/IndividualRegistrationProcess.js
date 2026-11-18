const RegistrationProcess = require("./RegistrationProcess");
const Registration = require("./Registration");

class IndividualRegistrationProcess extends RegistrationProcess {
    /**
     * Individual entries never carry a team name. (Previously a stray name was
     * stored, and cancelling then removed everyone who typed the same name.)
     */
    resolveTeamName() {
        return null;
    }

    buildRegistrations([usn]) {
        return [new Registration({ eventId: this.event.id, usn })];
    }
}

module.exports = IndividualRegistrationProcess;
