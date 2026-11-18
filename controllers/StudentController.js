class StudentController {
    #events;
    #registrations;

    constructor({ eventService, registrationService }) {
        this.#events = eventService;
        this.#registrations = registrationService;
    }

    dashboard = async (req, res) => {
        res.json(await this.#events.getStudentDashboard(req.user.id));
    };

    myRegistrations = async (req, res) => {
        res.json(await this.#registrations.listForStudent(req.user.id));
    };

    eventDetails = async (req, res) => {
        res.json(await this.#events.getEventForStudent(req.params.eventId, req.user.id));
    };

    register = async (req, res) => {
        await this.#registrations.register(req.params.eventId, req.user.id, req.body);
        res.json({ message: "Registration successful", redirecturl: "/student/registrations" });
    };

    cancel = async (req, res) => {
        await this.#registrations.cancel(req.params.eventId, req.user.id);
        res.json({ message: "Registration cancelled" });
    };
}

module.exports = StudentController;
