const Event = require("./Event");
const IndividualRegistrationProcess = require("../registration/IndividualRegistrationProcess");

/** Students register one by one; capacity counts students. */
class IndividualEvent extends Event {
    get isIndividual() {
        return true;
    }

    getMemberLimits() {
        return { min: 1, max: 1 };
    }

    toRulesRecord() {
        // Team sizes don't apply; store NULL rather than 1/1.
        return { ...super.toRulesRecord(), min_members: null, max_members: null };
    }

    createRegistrationProcess(gateway) {
        return new IndividualRegistrationProcess(this, gateway);
    }
}

module.exports = IndividualEvent;
