const {
    getStudentInfoByUsn,
    getEventsForStudentDashboard,
    getEventRegistrationInfo,
    getMissingStudents,
    getAlreadyRegisteredMembers,
    registerStudentsForEvent,
    getRegisteredEventsForStudent,
    cancelStudentRegistration
} = require("../models/studentModel");
const { checkUSNformat } = require("../utils/validateUserInput");

const EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

const getEventStatus = (event, now = new Date()) => {
    const datePart = String(event.event_date).slice(0, 10);
    const timePart = String(event.event_time || "00:00:00").split(".")[0];
    const eventStart = new Date(`${datePart}T${timePart}`);
    const eventEnd = new Date(eventStart.getTime() + EVENT_DURATION_MS);

    if (now >= eventStart && now <= eventEnd)
        return "ongoing";
    if (now > eventEnd)
        return "completed";
    return "upcoming";
};

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const [student, events] = await Promise.all([
            getStudentInfoByUsn(userId),
            getEventsForStudentDashboard(userId)
        ]);

        return res.json({ student, events });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMyRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;
        const [student, registrations] = await Promise.all([
            getStudentInfoByUsn(userId),
            getRegisteredEventsForStudent(userId)
        ]);

        const now = new Date();
        const registrationsWithStatus = (registrations || []).map((event) => ({
            ...event,
            status: getEventStatus(event, now)
        }));

        return res.json({
            student,
            registrations: registrationsWithStatus
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getEventDetails = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    try {
        const [student, event] = await Promise.all([
            getStudentInfoByUsn(userId),
            getEventRegistrationInfo(eventId, userId)
        ]);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json({ student, event });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.registerForEvent = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    const fail = (status, message) => res.status(status).json({ message });

    try {
        const event = await getEventRegistrationInfo(eventId, userId);

        if (!event) {
            return fail(404, "Event not found");
        }

        if (event.is_registered) {
            return fail(409, "You are already registered for this event.");
        }

        const capacity = Number(event.total_capacity || 0);
        if (capacity > 0 && Number(event.registered || 0) >= capacity) {
            return fail(409, "This event has reached capacity.");
        }

        const rawUsns = Array.isArray(req.body.teamUsns)
            ? req.body.teamUsns
            : [req.body.teamUsns];
        const submittedTeamName = String(req.body.teamName || "").trim();
        const teamName = submittedTeamName.length > 0 ? submittedTeamName : null;

        const normalizedUsns = [...new Set(
            rawUsns
                .map((usn) => String(usn || "").trim().toUpperCase())
                .filter((usn) => usn.length > 0)
        )];

        if (!event.isindividual && !teamName) {
            return fail(400, "Team name is required for team events.");
        }

        const minMembers = event.isindividual ? 1 : Number(event.min_members || 1);
        const maxMembers = event.isindividual ? 1 : Number(event.max_members || minMembers);

        if (normalizedUsns.length < minMembers || normalizedUsns.length > maxMembers) {
            return fail(400, `Enter between ${minMembers} and ${maxMembers} valid USN values.`);
        }

        const invalidUsns = normalizedUsns.filter((usn) => !checkUSNformat(usn));
        if (invalidUsns.length > 0) {
            return fail(400, `Invalid USN format: ${invalidUsns.join(", ")}`);
        }

        if (!normalizedUsns.includes(String(userId).toUpperCase())) {
            return fail(400, "Your own USN must be included in the team list.");
        }

        const missingStudents = await getMissingStudents(normalizedUsns);
        if (missingStudents.length > 0) {
            return fail(400, `These USNs do not have EventHub accounts: ${missingStudents.join(", ")}`);
        }

        const alreadyRegistered = await getAlreadyRegisteredMembers(eventId, normalizedUsns);
        if (alreadyRegistered.length > 0) {
            return fail(400, `Already registered for this event: ${alreadyRegistered.join(", ")}`);
        }

        await registerStudentsForEvent(eventId, normalizedUsns, teamName);

        return res.json({
            message: "Registration successful",
            redirecturl: "/student/registrations"
        });
    } catch (error) {
        console.log(error);
        return fail(500, "Unable to register right now. Try again.");
    }
};

exports.cancelRegistration = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    try {
        const cancelled = await cancelStudentRegistration(eventId, userId);

        if (!cancelled) {
            return res.status(404).json({ message: "Registration not found" });
        }

        return res.json({ message: "Registration cancelled" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
