const IndividualEvent = require("./IndividualEvent");
const TeamEvent = require("./TeamEvent");
const Venue = require("./Venue");
const Coordinator = require("./Coordinator");
const { ValidationError } = require("../../core/errors");

/**
 * Builds the right Event subclass from the two places events come from:
 * a database row (`isindividual` flag) or the organizer's form (`eventType.type`).
 * This is the only place that knows how those encodings map to classes.
 */
class EventFactory {
    static #types = {
        individual: IndividualEvent,
        team: TeamEvent,
    };

    static create(type, props) {
        const EventClass = EventFactory.#types[type];
        if (!EventClass) {
            throw new ValidationError("Event type is required");
        }
        return new EventClass(props);
    }

    /** From a SQL row joined with `rules` (and optionally `venue`). */
    static fromRow(row) {
        return EventFactory.create(row.isindividual ? "individual" : "team", {
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            date: row.event_date,
            time: row.event_time,
            groupChatLink: row.group_chatlink,
            imageUrl: row.imgurl,
            organizerId: row.organizerid,
            venue: new Venue({ id: row.venue_id ?? null, block: row.block, hall: row.hall }),
            capacity: row.total_capacity,
            minMembers: row.min_members,
            maxMembers: row.max_members,
            departmentAllowed: row.department_allowed,
            coordinators: (row.coordinators || []).map((c) => new Coordinator(c)),
            registeredCount: row.registered ?? row.total_registrations ?? 0,
        });
    }

    /** From the organizer form payload (the JSON in the `data` field). */
    static fromForm(data, { id = null, organizerId, imageUrl = null }) {
        const eventType = data?.eventType || {};
        const isIndividual = eventType.type === "individual";

        return EventFactory.create(eventType.type, {
            id,
            organizerId,
            imageUrl,
            name: data.eventName,
            category: data.category,
            description: data.description,
            date: data.date,
            time: data.time,
            groupChatLink: data.groupChatLink,
            venue: new Venue({ block: data.block, hall: data.hall }),
            capacity: isIndividual ? eventType.capacity : eventType.totalTeams,
            minMembers: eventType.minSize,
            maxMembers: eventType.maxSize,
            departmentAllowed: data.departmentRestriction,
            coordinators: (Array.isArray(data.coordinators) ? data.coordinators : []).map((c) => new Coordinator(c)),
        }).validate();
    }
}

module.exports = EventFactory;
