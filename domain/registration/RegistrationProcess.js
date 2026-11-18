const Usn = require("../Usn");
const { ConflictError, ValidationError } = require("../../core/errors");

/**
 * «Template Method» — registering for an event always runs the same checks
 * in the same order; only how the team name is resolved and how the
 * participants are recorded differ between individual and team events.
 *
 * `gateway` is the persistence port, already bound to the current transaction:
 *   isRegistered(eventId, usn), findMissingStudents(usns),
 *   findAlreadyRegistered(eventId, usns), save(registrations)
 */
class RegistrationProcess {
    constructor(event, gateway) {
        if (new.target === RegistrationProcess) {
            throw new TypeError("RegistrationProcess is abstract");
        }
        this.event = event;
        this.gateway = gateway;
    }

    /** The template method. Subclasses must not override it. */
    async register(student, input) {
        await this.#ensureOpenFor(student);
        const teamName = this.resolveTeamName(input);
        const members = this.#collectMembers(input);
        this.#checkMemberCount(members);
        this.#checkUsnFormats(members);
        this.#checkIncludes(student, members);
        await this.#checkAccountsExist(members);
        await this.#checkNotAlreadyRegistered(members);

        const registrations = this.buildRegistrations(members, teamName);
        await this.gateway.save(registrations);
        return registrations;
    }

    // ---- hooks ---------------------------------------------------------------

    /** @returns {string|null} */
    resolveTeamName(input) {
        throw new Error("abstract");
    }

    /** @returns {import("./Registration")[]} */
    buildRegistrations(memberUsns, teamName) {
        throw new Error("abstract");
    }

    // ---- fixed steps ---------------------------------------------------------

    async #ensureOpenFor(student) {
        if (await this.gateway.isRegistered(this.event.id, student.usn.value)) {
            throw new ConflictError("You are already registered for this event.");
        }
        if (this.event.isFull()) {
            throw new ConflictError("This event has reached capacity.");
        }
    }

    #collectMembers(input) {
        const raw = Array.isArray(input?.teamUsns) ? input.teamUsns : [input?.teamUsns];
        return [...new Set(raw.map(Usn.normalize).filter((usn) => usn.length > 0))];
    }

    #checkMemberCount(members) {
        const { min, max } = this.event.getMemberLimits();
        if (members.length < min || members.length > max) {
            throw new ValidationError(`Enter between ${min} and ${max} valid USN values.`);
        }
    }

    #checkUsnFormats(members) {
        const invalid = members.filter((usn) => !Usn.isValid(usn));
        if (invalid.length > 0) {
            throw new ValidationError(`Invalid USN format: ${invalid.join(", ")}`);
        }
    }

    #checkIncludes(student, members) {
        if (!members.includes(student.usn.value)) {
            throw new ValidationError("Your own USN must be included in the team list.");
        }
    }

    async #checkAccountsExist(members) {
        const missing = await this.gateway.findMissingStudents(members);
        if (missing.length > 0) {
            throw new ValidationError(`These USNs do not have EventHub accounts: ${missing.join(", ")}`);
        }
    }

    async #checkNotAlreadyRegistered(members) {
        const taken = await this.gateway.findAlreadyRegistered(this.event.id, members);
        if (taken.length > 0) {
            throw new ValidationError(`Already registered for this event: ${taken.join(", ")}`);
        }
    }
}

module.exports = RegistrationProcess;
