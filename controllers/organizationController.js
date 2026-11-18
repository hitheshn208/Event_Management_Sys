const {checkVenue, registerEvent, addrules, addcoordinators, getEventsByOrgId, getRegistrationEventsByOrgId, getEventRegistrationsForOrg, getEventInfoByid, updateEvent, deleteEvent, getOrgInfo} = require("../models/organizerModel")

const serverError = (res) => res.status(500).json({ message: "Internal server error" });

exports.getOrgDashboard = async (req, res)=>{
    try {
        const [events, org] = await Promise.all([
            getEventsByOrgId(req.user.id),
            getOrgInfo(req.user.id)
        ]);
        return res.json({ events, org });
    } catch (e) {
        console.log(e);
        return serverError(res);
    }
}

exports.getAllEventRegistrations = async (req, res) => {
    try {
        const [org, events] = await Promise.all([
            getOrgInfo(req.user.id),
            getRegistrationEventsByOrgId(req.user.id)
        ]);

        return res.json({ org, events });
    } catch (error) {
        console.log(error);
        return serverError(res);
    }
};

exports.getEventRegistrations = async (req, res) => {
    const orgId = req.user.id;
    const eventId = req.params.eventId;

    try {
        const [org, eventData] = await Promise.all([
            getOrgInfo(orgId),
            getEventRegistrationsForOrg(eventId, orgId)
        ]);

        if (!eventData) {
            return res.status(404).json({ message: "Event not found" });
        }

        const capacity = Number(eventData.event.total_capacity || 0);
        const registrationPercent = capacity > 0
            ? Math.min(100, Math.round((eventData.totalRegistrations / capacity) * 100))
            : 0;

        return res.json({
            org,
            event: eventData.event,
            registrations: eventData.registrations,
            totalRegistrations: eventData.totalRegistrations,
            capacity,
            registrationPercent
        });
    } catch (error) {
        console.log(error);
        return serverError(res);
    }
};

exports.createEvent = async (req, res)=>{
    const organiserid = req.user.id;

    try{
        // eventInstructions is collected by the form but not stored yet.
        const {eventName, category, description, date, time, block, hall, groupChatLink, departmentRestriction, eventInstructions, eventType, coordinators} = JSON.parse(req.body.data);
        const path = req.file ? "/uploads/" + req.file.filename : null;

        const venueId = await checkVenue(block, hall);
        if(!venueId)
            return res.status(400).json({
                message: "Venue not found"
            })
        
        const eventId = await registerEvent(eventName, category, description, date, time, groupChatLink, organiserid, venueId, path);

        if(eventType.type === "individual")
            await addrules(eventId, true, Number(eventType.capacity), null, null, departmentRestriction);
        else
            await addrules(eventId, false, Number(eventType.totalTeams), Number(eventType.minSize), Number(eventType.maxSize), departmentRestriction);

        if (Array.isArray(coordinators) && coordinators.length > 0)
            await addcoordinators(coordinators, eventId);

        return res.status(200).json({
            message : "Event created successfully",
            redirectUrl: "/organization/dashboard"
        })

    }catch(e){
        console.log(e)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

exports.getEventForEdit = async (req, res)=>{
    const eventid = req.params.eventId;
    const orgId = req.user.id;
    try {
        const eventInfo = await getEventInfoByid(eventid, orgId);

        if (!eventInfo) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.json({ event: eventInfo });
    } catch (error) {
        console.log(error);
        return serverError(res);
    }
}

exports.updateEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const orgId = req.user.id;

    try {
        const parsedData = JSON.parse(req.body.data);
        const imgurl = req.file ? "/uploads/" + req.file.filename : null;

        await updateEvent({
            eventId,
            orgId,
            name: parsedData.eventName,
            category: parsedData.category,
            description: parsedData.description,
            eventDate: parsedData.date,
            eventTime: parsedData.time,
            groupChatLink: parsedData.groupChatLink,
            block: parsedData.block,
            hall: parsedData.hall,
            imgurl,
            isindividual: parsedData.eventType.type === "individual",
            totalCapacity: parsedData.eventType.type === "individual" ? Number(parsedData.eventType.capacity) : Number(parsedData.eventType.totalTeams),
            minMembers: parsedData.eventType.type === "individual" ? null : Number(parsedData.eventType.minSize),
            maxMembers: parsedData.eventType.type === "individual" ? null : Number(parsedData.eventType.maxSize),
            departmentAllowed: parsedData.departmentRestriction,
            coordinators: parsedData.coordinators
        });

        return res.status(200).json({
            message: "Event updated successfully",
            redirectUrl: "/organization/dashboard"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
}

exports.deleteEvent = async (req, res) => {
    const eventId = req.params.code;
    const orgId = req.user.id;

    try {
        const event = await getEventInfoByid(eventId, orgId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        await deleteEvent(eventId, orgId);

        return res.status(200).json({
            message: "Event deleted successfully",
            redirectUrl: "/organization/dashboard"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
}