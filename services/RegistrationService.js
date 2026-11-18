const EventFactory = require("../domain/events/EventFactory");
const parseId = require("../core/parseId");
const { AuthenticationError, NotFoundError } = require("../core/errors");

/** «Facade» for a student's registrations: sign up, list, cancel. */
class RegistrationService {
    #db;
    #events;
    #registrations;
    #students;

    constructor({ database, eventRepository, registrationRepository, studentRepository }) {
        this.#db = database;
        this.#events = eventRepository;
        this.#registrations = registrationRepository;
        this.#students = studentRepository;
    }

    /**
     * Runs the event's registration process inside a transaction. The event
     * row is locked first, so two students can't both take the last seat.
     */
    async register(rawEventId, usn, input) {
        const eventId = parseId(rawEventId, "Event not found");

        return this.#db.transaction(async (client) => {
            if (!(await this.#events.lockForRegistration(eventId, client))) {
                throw new NotFoundError("Event not found");
            }
            const [row, student] = await Promise.all([
                this.#events.findForStudent(eventId, usn, client),
                this.#students.findByUsn(usn),
            ]);
            if (!student) throw new AuthenticationError();

            const event = EventFactory.fromRow(row);
            const process = event.createRegistrationProcess(this.#gatewayFor(client));
            return process.register(student, input);
        });
    }

    async listForStudent(usn, now = new Date()) {
        const [student, rows] = await Promise.all([this.#students.getProfile(usn), this.#registrations.listEventsForStudent(usn)]);
        const registrations = rows.map((row) => ({ ...row, status: EventFactory.fromRow(row).statusAt(now) }));
        return { student, registrations };
    }

    async cancel(rawEventId, usn) {
        const cancelled = await this.#registrations.cancel(parseId(rawEventId, "Registration not found"), usn);
        if (!cancelled) throw new NotFoundError("Registration not found");
    }

    /** Persistence port handed to RegistrationProcess, bound to one transaction. */
    #gatewayFor(client) {
        return {
            isRegistered: (eventId, usn) => this.#registrations.isRegistered(eventId, usn, client),
            findMissingStudents: (usns) => this.#students.findMissing(usns, client),
            findAlreadyRegistered: (eventId, usns) => this.#registrations.findAlreadyRegistered(eventId, usns, client),
            save: (registrations) => this.#registrations.insertMany(registrations, client),
        };
    }
}

module.exports = RegistrationService;
