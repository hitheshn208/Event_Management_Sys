const Event = require("./Event");
const TeamRegistrationProcess = require("../registration/TeamRegistrationProcess");
const { ValidationError } = require("../../core/errors");

/** Students register as named teams; capacity counts teams. */
class TeamEvent extends Event {
    constructor(props) {
        super(props);
        this.minMembers = Number(props.minMembers);
        this.maxMembers = Number(props.maxMembers);
    }

    validate() {
        super.validate();
        if (!Number.isInteger(this.minMembers) || this.minMembers < 1) {
            throw new ValidationError("Minimum team size must be at least 1");
        }
        if (!Number.isInteger(this.maxMembers) || this.maxMembers < this.minMembers) {
            throw new ValidationError("Maximum team size cannot be less than the minimum team size");
        }
        return this;
    }

    get isIndividual() {
        return false;
    }

    getMemberLimits() {
        const min = this.minMembers || 1;
        return { min, max: this.maxMembers || min };
    }

    createRegistrationProcess(gateway) {
        return new TeamRegistrationProcess(this, gateway);
    }
}

module.exports = TeamEvent;
