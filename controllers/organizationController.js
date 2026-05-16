const {checkVenue, registerEvent, addrules, addcoordinators, getEventsByOrgId, getEventInfoByid, updateEvent} = require("../models/organizerModel")

exports.showOrgDashboard = async (req, res)=>{
    try {
        const events = await getEventsByOrgId(req.user.id);
        res.render("orgdashboard", {events});
    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal server error");
    }
}

exports.showOrganiseEvent = (req, res)=>{
    res.render("eventregistration");
}

exports.createEvent = async (req, res)=>{
    const {eventName, category, description, date, time, block, hall, groupChatLink, departmentRestriction, eventInstructions, eventType, coordinators} = JSON.parse(req.body.data);    
    const organiserid = req.user.id;
    // const {path, mimetype} = req.file;
    const path = "/uploads/" + req.file.filename;
    // console.log(path);

    try{
        const venueId = await checkVenue(block, hall);
        if(!venueId)
            return res.status(401).json({
                message: "Venue not found"
            })
        
        const eventId = await registerEvent(eventName, category, description, date, time, groupChatLink, organiserid, venueId, path);

        if(eventType.type === "individual")
            await addrules(eventId, true, Number(eventType.capacity), null, null, departmentRestriction);
        else
            await addrules(eventId, false, Number(eventType.totalTeams), Number(eventType.minSize), Number(eventType.maxSize), departmentRestriction);

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
    console.log(req.body);
}

exports.editEvent = async (req, res)=>{
    const eventid = req.params.eventId;
    const orgId = req.user.id;
    try {
        const eventInfo = await getEventInfoByid(eventid, orgId);

        if (!eventInfo) {
            return res.status(404).send("Event not found");
        }

        return res.render("eventEdit", { event: eventInfo });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
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