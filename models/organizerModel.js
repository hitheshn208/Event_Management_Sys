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
        const baseIndex = index*4;
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

exports.getEventInfoByid = async (eventid, orgId)=>{
    const response = await db.query(`SELECT
    e.id,
    e.name,
    e.category,
    e.description,
    e.event_date,
    e.event_time,
    e.group_chatlink,
    e.organizerid,

    r.isindividual,
    r.total_capacity,
    r.min_members,
    r.max_members,
    r.department_allowed,

    v.id AS venue_id,
    v.block,
    v.hall,

    (
        SELECT COALESCE(
            json_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'phone', c.phone,
                    'email', c.email
                )
            ),
            '[]'
        )
        FROM coordinator c
        WHERE c.eventid = e.id
    ) AS coordinators

FROM event e

JOIN rules r
    ON r.eventid = e.id

JOIN venue v
    ON v.id = e.venueid

WHERE e.id = $1 AND organizerid = $2;`, [eventid, orgId]);

    return response.rows[0] || null;
}

exports.updateEvent = async ({ eventId, orgId, name, category, description, eventDate, eventTime, groupChatLink, block, hall, imgurl, isindividual, totalCapacity, minMembers, maxMembers, departmentAllowed, coordinators }) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const venueResponse = await client.query('SELECT id FROM venue WHERE block = $1 AND hall = $2', [block, hall]);

        if (venueResponse.rows.length === 0) {
            throw new Error('Venue not found');
        }

        const venueId = venueResponse.rows[0].id;

        const eventQuery = imgurl
            ? `UPDATE event
                SET name = $1,
                    category = $2,
                    description = $3,
                    event_date = $4,
                    event_time = $5,
                    group_chatlink = $6,
                    venueid = $7,
                    imgurl = $8
                WHERE id = $9 AND organizerid = $10`
            : `UPDATE event
                SET name = $1,
                    category = $2,
                    description = $3,
                    event_date = $4,
                    event_time = $5,
                    group_chatlink = $6,
                    venueid = $7
                WHERE id = $8 AND organizerid = $9`;

        const eventQueryValues = imgurl
            ? [name, category, description, eventDate, eventTime, groupChatLink, venueId, imgurl, eventId, orgId]
            : [name, category, description, eventDate, eventTime, groupChatLink, venueId, eventId, orgId];

        await client.query(eventQuery, eventQueryValues);

        await client.query(
            `UPDATE rules
                SET isindividual = $1,
                    total_capacity = $2,
                    min_members = $3,
                    max_members = $4,
                    department_allowed = $5
                WHERE eventid = $6`,
            [isindividual, totalCapacity, minMembers, maxMembers, departmentAllowed, eventId]
        );

        await client.query('DELETE FROM coordinator WHERE eventid = $1', [eventId]);

        if (coordinators && coordinators.length > 0) {
            const { query, values } = getCoordinatorQuery(coordinators, eventId);
            await client.query(query, values);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}