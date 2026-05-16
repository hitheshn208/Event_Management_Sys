const db = require("../config/database");

exports.checkVenue = async (block, hall)=>{
    const response = await db.query("SELECT id FROM VENUE WHERE block = $1 AND hall = $2", [block, hall]);
    
    if(response.rows.length == 0)
        return null;
    else
        return response.rows[0].id;
}

exports.registerEvent = async (name , category , description , event_date , event_time , group_chatlink , organizerid , venueid, imgurl)=>{
    const eventid = await db.query("INSERT INTO event (name , category , description , event_date , event_time , group_chatlink , organizerid , venueid, imgurl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id", [name, category, description, event_date, event_time, group_chatlink, organizerid, venueid, imgurl]);

    return eventid.rows[0].id;
}


exports.addrules = async (eventid , isindividual , total_capacity , min_members , max_mambers , department_allowed)=>{
    // console.log(eventid , isindividual , total_capacity , min_members , max_mambers , department_allowed)
    await db.query("INSERT INTO rules VALUES($1, $2, $3, $4, $5, $6)", [eventid , isindividual , total_capacity , min_members , max_mambers , department_allowed])
    

}

exports.addcoordinators = async (coordinators, eventId)=>{
    const {query, values} = getCoordinatorQuery(coordinators, eventId);
    
    await db.query(query, values);
    
}

function getCoordinatorQuery(coordinators, eventId){
    const values = []
    const placeholder = []

    coordinators.forEach((coordinator, index) => {
        baseIndex = index*4;
        placeholder.push(`($${baseIndex + 1},$${baseIndex + 2},$${baseIndex + 3}, $${baseIndex + 4})`);

        values.push(eventId);
        values.push(coordinator.name);
        values.push(coordinator.phone);
        values.push(coordinator.email);
    });

    let query = `INSERT INTO coordinator (eventid, name, phone, email) VALUES ${placeholder.join(",")}`
    return { query, values };
}

exports.getEventsByOrgId = async(orgid)=>{
    const response = await db.query(`SELECT  e.id, e.name, e.category, e.event_date, e.event_time, e.imgurl, r.isindividual, r.total_capacity, v.block, v.hall, COUNT(p.eventid) AS registered
    FROM event e
    JOIN rules r 
    ON r.eventid = e.id
    JOIN venue v 
    ON v.id = e.venueid
    LEFT JOIN participate p 
    ON p.eventid = e.id
    WHERE e.organizerid = $1
    GROUP BY 
        e.id,
        e.name,
        e.category,
        e.event_date,
        e.event_time,
        e.imgurl,
        r.isindividual,
        r.total_capacity,
        v.block,
        v.hall;`, [orgid]);

    return response.rows;
}