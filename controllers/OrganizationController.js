const { ValidationError } = require("../core/errors");

const DASHBOARD = "/organization/dashboard";

class OrganizationController {
    #events;

    constructor({ eventService }) {
        this.#events = eventService;
    }

    dashboard = async (req, res) => {
        res.json(await this.#events.getOrganizerDashboard(req.user.id));
    };

    registrationOverview = async (req, res) => {
        res.json(await this.#events.getRegistrationOverview(req.user.id));
    };

    eventRegistrations = async (req, res) => {
        res.json(await this.#events.getEventRegistrations(req.params.eventId, req.user.id));
    };

    createEvent = async (req, res) => {
        const { data, imageUrl } = OrganizationController.#readEventForm(req);
        await this.#events.createEvent(req.user.id, data, imageUrl);
        res.json({ message: "Event created successfully", redirectUrl: DASHBOARD });
    };

    editableEvent = async (req, res) => {
        res.json(await this.#events.getEditableEvent(req.params.eventId, req.user.id));
    };

    updateEvent = async (req, res) => {
        const { data, imageUrl } = OrganizationController.#readEventForm(req);
        await this.#events.updateEvent(req.params.eventId, req.user.id, data, imageUrl);
        res.json({ message: "Event updated successfully", redirectUrl: DASHBOARD });
    };

    deleteEvent = async (req, res) => {
        await this.#events.deleteEvent(req.params.eventId, req.user.id);
        res.json({ message: "Event deleted successfully", redirectUrl: DASHBOARD });
    };

    /** The event form is multipart: JSON in `data`, optional file in `image`. */
    static #readEventForm(req) {
        let data;
        try {
            data = JSON.parse(req.body?.data);
        } catch {
            throw new ValidationError("Invalid event data");
        }
        if (!data || typeof data !== "object") throw new ValidationError("Invalid event data");
        return { data, imageUrl: req.file ? `/uploads/${req.file.filename}` : null };
    }
}

module.exports = OrganizationController;
