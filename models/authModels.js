const db = require("../config/database");

exports.checkRegistered = async (usn)=>{
    const response = await db.query("SELECT * FROM student WHERE usn = $1", [usn]);
    console.log(response.rows.length)
    if(response.rows.length === 0 )
        return false;
    else
        return true;
}

exports.findStudentByUSN = async (usn) => {
        const response = await db.query("SELECT * FROM student WHERE usn = $1", [usn.toUpperCase()]);

        if (response.rows.length === 0) {
            return null;
        }

        return response.rows[0];
}

exports.registerUser = async (usn, name, phone, email, hashedPassword, dept, year_out)=>{
        await db.query("INSERT INTO student (usn, name, phone, email, password, dept, year_out) VALUES ($1, $2, $3, $4, $5, $6, $7)", [usn, name, phone, email, hashedPassword, dept, year_out]);    
        return true;
}

exports.checkOrgRegistered = async (username, name)=>{
    const response = await db.query("SELECT * FROM organization WHERE username = $1 OR name = $2", [username, name]);
    if(response.rows.length === 0 )
        return false;
    else
        return true;
}

exports.registerOrgdb = async (name, username, email, hashedPassword) =>{
    const response = await db.query("INSERT INTO organization (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id", [name, username, email, hashedPassword]);
    console.log(response.rows[0].id);
    return response.rows[0].id;
}

exports.findOrg = async (username)=>{
        const response = await db.query("SELECT * FROM organization WHERE username = $1", [username]);
        if (response.rows.length === 0) {
            return null;
        }
        return response.rows[0];
}