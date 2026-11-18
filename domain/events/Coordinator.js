/** Contact person for an event. Part of an Event (composition). */
class Coordinator {
    constructor({ name, phone, email }) {
        this.name = String(name ?? "").trim();
        this.phone = String(phone ?? "").trim();
        this.email = String(email ?? "").trim();
    }
}

module.exports = Coordinator;
