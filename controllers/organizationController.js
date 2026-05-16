const {checkVenue, registerEvent, addrules, addcoordinators, getEventsByOrgId} = require("../models/organizerModel")

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