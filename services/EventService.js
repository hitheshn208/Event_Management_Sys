const EventFactory = require("../domain/events/EventFactory");
const parseId = require("../core/parseId");
const { NotFoundError } = require("../core/errors");

const EVENT_NOT_FOUND = "Event not found";

/**
 * «Facade» over the event, venue, coordinator, registration and profile
 * repositories. Controllers call one method per screen instead of
 * orchestrating five data-access objects themselves.
 */
class EventService {
    #db;
    #events;
    #venues;
    #coordinators;
    #registrations;
    #students;
    #organizations;

    constructor({ database, eventRepository, venueRepository, coordinatorRepository, registrationRepository, studentRepository, organizationRepository }) {
        this.#db = database;
        this.#events = eventRepository;
        this.#venues = venueRepository;
        this.#coordinators = coordinatorRepository;
        this.#registrations = registrationRepository;
        this.#students = studentRepository;
        this.#organizations = organizationRepository;
    }

    // ---- student-facing ------------------------------------------------------

    async getStudentDashboard(usn) {
        const [student, events] = await Promise.all([this.#students.getProfile(usn), this.#events.listForStudent(usn)]);
        return { student, events };
    }

    async getEventForStudent(rawEventId, usn) {
        const eventId = parseId(rawEventId, EVENT_NOT_FOUND);
        const [student, event] = await Promise.all([this.#students.getProfile(usn), this.#events.findForStudent(eventId, usn)]);
        if (!event) throw new NotFoundError(EVENT_NOT_FOUND);
        return { student, event };
    }

    // ---- organizer-facing ----------------------------------------------------

    async getOrganizerDashboard(orgId) {
        const [events, org] = await Promise.all([this.#events.listForOrganizer(orgId), this.#organizations.getProfile(orgId)]);
        return { events, org };
    }

    async getRegistrationOverview(orgId) {
        const [org, events] = await Promise.all([this.#organizations.getProfile(orgId), this.#events.listRegistrationSummary(orgId)]);
        return { org, events };
    }

    async getEventRegistrations(rawEventId, orgId) {
        const eventId = parseId(rawEventId, EVENT_NOT_FOUND);
        const [org, row] = await Promise.all([this.#organizations.getProfile(orgId), this.#events.findSummaryForOrganizer(eventId, orgId)]);
        if (!row) throw new NotFoundError(EVENT_NOT_FOUND);

        const event = EventFactory.fromRow(row);
        const [registrations, totalRegistrations] = await Promise.all([
            this.#registrations.listParticipants(event),
            this.#registrations.countForEvent(event.id),
        ]);

        return {
            org,
            event: row,
            registrations,
            totalRegistrations,
            capacity: event.capacity || 0,
            registrationPercent: event.fillPercent(totalRegistrations),
        };
    }

    async getEditableEvent(rawEventId, orgId) {
        const event = await this.#events.findEditable(parseId(rawEventId, EVENT_NOT_FOUND), orgId);
        if (!event) throw new NotFoundError(EVENT_NOT_FOUND);
        return { event };
    }

    /** Event, rules and coordinators are written in one transaction. */
    async createEvent(orgId, formData, imageUrl) {
        const event = EventFactory.fromForm(formData, { organizerId: orgId, imageUrl });

        return this.#db.transaction(async (client) => {
            event.venue = await this.#venues.resolve(event.venue, client);
            await this.#events.insert(event, client);
            await this.#coordinators.insertMany(event.id, event.coordinators, client);
            return event;
        });
    }

    async updateEvent(rawEventId, orgId, formData, imageUrl) {
        const eventId = parseId(rawEventId, EVENT_NOT_FOUND);
        const event = EventFactory.fromForm(formData, { id: eventId, organizerId: orgId, imageUrl });

        return this.#db.transaction(async (client) => {
            if (!(await this.#events.isOwnedBy(eventId, orgId, client))) {
                throw new NotFoundError(EVENT_NOT_FOUND);
            }
            event.venue = await this.#venues.resolve(event.venue, client);
            await this.#events.update(event, client);
            await this.#coordinators.replaceAll(event.id, event.coordinators, client);
            return event;
        });
    }

    async deleteEvent(rawEventId, orgId) {
        const deleted = await this.#events.delete(parseId(rawEventId, EVENT_NOT_FOUND), orgId);
        if (!deleted) throw new NotFoundError(EVENT_NOT_FOUND);
    }
}

module.exports = EventService;
