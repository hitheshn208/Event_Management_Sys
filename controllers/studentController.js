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

exports.showDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const [student, events] = await Promise.all([
            getStudentInfoByUsn(userId),
            getEventsForStudentDashboard(userId)
        ]);

        res.render("studentDashboard", { student, events, userId });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};

exports.showMyRegistrationsPage = async (req, res) => {
    try {
        const userId = req.user.id;
        const [student, registrations] = await Promise.all([
            getStudentInfoByUsn(userId),
            getRegisteredEventsForStudent(userId)
        ]);

        const now = new Date();
        const registrationsWithStatus = (registrations || []).map((event) => {
            const datePart = new Date(event.event_date).toISOString().split("T")[0];
            const timePart = String(event.event_time || "00:00:00").split(".")[0];
            const eventStart = new Date(`${datePart}T${timePart}`);
            const eventEnd = new Date(eventStart.getTime() + (3 * 60 * 60 * 1000));

            let status = "upcoming";
            if (now >= eventStart && now <= eventEnd) {
                status = "ongoing";
            } else if (now > eventEnd) {
                status = "completed";
            }

            return {
                ...event,
                status
            };
        });

        return res.render("studentRegistrations", {
            student,
            userId,
            registrations: registrationsWithStatus
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};

exports.showEventRegistrationPage = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    try {
        const [student, event] = await Promise.all([
            getStudentInfoByUsn(userId),
            getEventRegistrationInfo(eventId, userId)
        ]);

        if (!event) {
            return res.status(404).send("Event not found");
        }

        return res.render("studentEventRegister", {
            student,
            userId,
            event,
            error: null,
            submittedUsns: [],
            submittedTeamName: ""
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};

exports.showEventDetailsPage = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    try {
        const [student, event] = await Promise.all([
            getStudentInfoByUsn(userId),
            getEventRegistrationInfo(eventId, userId)
        ]);

        if (!event) {
            return res.status(404).send("Event not found");
        }

        return res.render("studentEventDetails", {
            student,
            userId,
            event
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};

exports.registerForEvent = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;
    let submittedTeamName = "";

    try {
        const [student, event] = await Promise.all([
            getStudentInfoByUsn(userId),
            getEventRegistrationInfo(eventId, userId)
        ]);

        if (!event) {
            return res.status(404).send("Event not found");
        }

        if (event.is_registered) {
            return res.redirect("/student/dashboard");
        }

        const rawUsns = Array.isArray(req.body.teamUsns)
            ? req.body.teamUsns
            : [req.body.teamUsns];
        submittedTeamName = String(req.body.teamName || "").trim();
        const teamName = submittedTeamName.length > 0 ? submittedTeamName : null;

        if (!event.isindividual && !teamName) {
            return res.status(400).render("studentEventRegister", {
                student,
                userId,
                event,
                error: "Team name is required for team events.",
                submittedUsns: normalizedUsns,
                submittedTeamName
            });
        }

        const normalizedUsns = [...new Set(
            rawUsns
                .map((usn) => String(usn || "").trim().toUpperCase())
                .filter((usn) => usn.length > 0)
        )];

        const minMembers = event.isindividual ? 1 : Number(event.min_members || 1);
        const maxMembers = event.isindividual ? 1 : Number(event.max_members || minMembers);

        if (normalizedUsns.length < minMembers || normalizedUsns.length > maxMembers) {
            return res.status(400).render("studentEventRegister", {
                student,
                userId,
                event,
                error: `Enter between ${minMembers} and ${maxMembers} valid USN values.`,
                submittedUsns: normalizedUsns,
                submittedTeamName
            });
        }

        const invalidUsns = normalizedUsns.filter((usn) => !checkUSNformat(usn));
        if (invalidUsns.length > 0) {
            return res.status(400).render("studentEventRegister", {
                student,
                userId,
                event,
                error: `Invalid USN format: ${invalidUsns.join(", ")}`,
                submittedUsns: normalizedUsns,
                submittedTeamName
            });
        }

        if (!normalizedUsns.includes(String(userId).toUpperCase())) {
            return res.status(400).render("studentEventRegister", {
                student,
                userId,
                event,
                error: "Your own USN must be included in the team list.",
                submittedUsns: normalizedUsns,
                submittedTeamName
            });
        }

        const missingStudents = await getMissingStudents(normalizedUsns);
        if (missingStudents.length > 0) {
            return res.status(400).render("studentEventRegister", {
                student,
                userId,
                event,
                error: `These USNs do not have EventHub accounts: ${missingStudents.join(", ")}`,
                submittedUsns: normalizedUsns,
                submittedTeamName
            });
        }

        const alreadyRegistered = await getAlreadyRegisteredMembers(eventId, normalizedUsns);
        if (alreadyRegistered.length > 0) {
            return res.status(400).render("studentEventRegister", {
                student,
                userId,
                event,
                error: `Already registered for this event: ${alreadyRegistered.join(", ")}`,
                submittedUsns: normalizedUsns,
                submittedTeamName
            });
        }

        await registerStudentsForEvent(eventId, normalizedUsns, teamName);

        return res.redirect("/student/dashboard");
    } catch (error) {
        console.log(error);

        try {
            const [student, event] = await Promise.all([
                getStudentInfoByUsn(userId),
                getEventRegistrationInfo(eventId, userId)
            ]);

            if (event) {
                return res.status(500).render("studentEventRegister", {
                    student,
                    userId,
                    event,
                    error: "Unable to register right now. Try again.",
                    submittedUsns: [],
                    submittedTeamName
                });
            }
        } catch (renderError) {
            console.log(renderError);
        }

        return res.status(500).send("Internal server error");
    }
};

exports.cancelRegistration = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    try {
        await cancelStudentRegistration(eventId, userId);
        return res.redirect("/student/registrations");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};