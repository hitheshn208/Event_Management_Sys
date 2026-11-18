const { ValidationError } = require("../../core/errors");

const EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

/**
 * Abstract event. The two concrete kinds differ in who registers (one student
 * vs a team) and how capacity is counted; everything else is shared here.
 *
 * Replaces the `isindividual` flag that used to be checked in ~6 places.
 */
class Event {
    constructor({
        id = null,
        name,
        category,
        description = null,
        date,
        time,
        groupChatLink = null,
        imageUrl = null,
        organizerId = null,
        venue,
        capacity,
        departmentAllowed = null,
        coordinators = [],
        registeredCount = 0,
    }) {
        if (new.target === Event) {
            throw new TypeError("Event is abstract; use EventFactory");
        }
        this.id = id;
        this.name = String(name ?? "").trim();
        this.category = category;
        this.description = description;
        this.date = date;
        this.time = time;
        this.groupChatLink = groupChatLink || null;
        this.imageUrl = imageUrl;
        this.organizerId = organizerId;
        this.venue = venue;
        this.capacity = Number(capacity);
        this.departmentAllowed = departmentAllowed || null;
        this.coordinators = coordinators;
        this.registeredCount = Number(registeredCount || 0);
    }

    /** Called by the factory for events built from user input. */
    validate() {
        if (!this.name) throw new ValidationError("Event name is required");
        if (!this.date || !this.time) throw new ValidationError("Event date and time are required");
        if (!Number.isInteger(this.capacity) || this.capacity < 1) {
            throw new ValidationError("Total capacity must be at least 1");
        }
        return this;
    }

    // ---- type-specific behaviour (overridden) --------------------------------

    /** @returns {boolean} */
    get isIndividual() {
        throw new Error("abstract");
    }

    /** @returns {{min: number, max: number}} people per registration */
    getMemberLimits() {
        throw new Error("abstract");
    }

    /**
     * «Factory Method» — each kind of event creates the registration
     * workflow that matches it.
     * @returns {import("../registration/RegistrationProcess")}
     */
    createRegistrationProcess(gateway) {
        throw new Error("abstract");
    }

    // ---- shared behaviour ----------------------------------------------------

    isFull() {
        return this.capacity > 0 && this.registeredCount >= this.capacity;
    }

    /** Percentage of capacity used, 0–100. */
    fillPercent(count = this.registeredCount) {
        if (!(this.capacity > 0)) return 0;
        return Math.min(100, Math.round((count / this.capacity) * 100));
    }

    startsAt() {
        const datePart = String(this.date).slice(0, 10);
        const timePart = String(this.time || "00:00:00").split(".")[0];
        return new Date(`${datePart}T${timePart}`);
    }

    /** @returns {"upcoming"|"ongoing"|"completed"} */
    statusAt(now = new Date()) {
        const start = this.startsAt();
        const end = new Date(start.getTime() + EVENT_DURATION_MS);
        if (now >= start && now <= end) return "ongoing";
        if (now > end) return "completed";
        return "upcoming";
    }

    /** Row for the `rules` table (one per event). */
    toRulesRecord() {
        const { min, max } = this.getMemberLimits();
        return {
            isindividual: this.isIndividual,
            total_capacity: this.capacity,
            min_members: min,
            max_members: max,
            department_allowed: this.departmentAllowed,
        };
    }
}

module.exports = Event;
