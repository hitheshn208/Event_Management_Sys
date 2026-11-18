const {checkRegistered, registerUser, findStudentByUSN, checkOrgRegistered, registerOrgdb, findOrg} = require("../models/authModels");
const {checkUSNformat} = require("../utils/validateUserInput");
const {hashPassword, comparePassword} = require("../utils/hashPassword");
const {setCookie} = require("../utils/generateToken");
const {decodeToken} = require("../middleware/authmiddleware");
const {getStudentInfoByUsn} = require("../models/studentModel");
const {getOrgInfo} = require("../models/organizerModel");

const clearAuthCookie = (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
};

exports.getCurrentUser = async (req, res) => {
    const decoded = decodeToken(req);

    if (!decoded)
        return res.status(401).json({ message: "Not logged in" });

    try {
        if (decoded.role === "student") {
            const student = await getStudentInfoByUsn(decoded.id);
            if (student)
                return res.json({ role: "student", user: student });
        } else if (decoded.role === "organization") {
            const org = await getOrgInfo(decoded.id);
            if (org)
                return res.json({ role: "organization", user: { id: decoded.id, ...org } });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }

    // Token is valid but the account no longer exists.
    clearAuthCookie(res);
    return res.status(401).json({ message: "Not logged in" });
}

exports.registerStudent = async (req, res)=>{
    const { name, phone, email, password } = req.body;
    const usn = String(req.body.usn || "").trim().toUpperCase();

    if(!checkUSNformat(usn))
    {
        return res.status(401).json({
            message : "Invalid USN Format"
        })
    }
    try{
        const isRegistered = await checkRegistered(usn);                            //^Query
        if(isRegistered)
        return res.status(401).json({
            message : "USN already registered"
        })
    }catch(e){
        console.log(e);
        return res.status(401).json({
            message: "Unable to register now. Try again later"
        })
    }
    const dept = usn.slice(5,7);
    const year_in = usn.slice(3,5);
    const year_out = Number("20" + (Number(year_in)+4));
    const hashedPassword = await hashPassword(password);
    try{
        await registerUser(usn, name, phone, email, hashedPassword, dept, year_out);                 //^Query
    }catch(e){
        console.log(e);
        return res.status(401).json({
            message: "Unable to register now. Try again"
        })
    }
        setCookie(res, usn, "student");
        return res.json({
            message : "Successfully Registered",
            redirecturl : "/student/dashboard"
        })
}

exports.loginStudent = async (req, res) => {
    const usn = String(req.body.usn || "").trim().toUpperCase();
    const { password } = req.body;

    if (!usn || !password) {
        return res.status(400).json({
            message: "USN and password are required"
        });
    }

    if(!checkUSNformat(usn))
    {
        return res.status(401).json({
            message : "Invalid USN Format"
        })
    }

    try{
        const student = await findStudentByUSN(usn.trim())                               //^Query
        if (!student) {
        return res.status(401).json({
            message: "Invalid USN or password"
        });
        }
        const isPasswordValid = await comparePassword(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid USN or password"
            });
        }
    }catch(e){
        return res.status(500).json({
            message : "Internal server error"
        })
    }
    setCookie(res, usn, "student");
    return res.json({
        message: "Login successful",
        redirecturl: "/student/dashboard"
    });
}

exports.registerOrg = async(req, res)=>{
    const { name, username, email, password } = req.body;
    let id;
    try{
        const isRegistered = await checkOrgRegistered(username, name);
        if(isRegistered)
        return res.status(401).json({
            message : "Organization already registered"
        })
        const hashedPassword = await hashPassword(password);        
        id = await registerOrgdb(name, username, email, hashedPassword);
    }catch(e){
        console.log(e);
        return res.status(401).json({
            message: "Unable to register now. Try again later"
        })
    }
    setCookie(res, id, "organization");
    return res.json({
        message : "Successfully Registered",
        redirecturl : "/organization/dashboard"
    })

}

exports.loginOrg = async(req, res)=>{

    const { username, password} = req.body;
    let organization;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }
    try{
        organization = await findOrg(username.trim())                               //^Query
        if (!organization) {
        return res.status(401).json({
            message: "Username not found"
        });
        }
        const isPasswordValid = await comparePassword(password, organization.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({
            message : "Internal server error"
        })
    }
    setCookie(res, organization.id, "organization");
    return res.json({
        message: "Login successful",
        redirecturl: "/organization/dashboard"
    });
}


exports.logoutUser = (req, res)=>{
    clearAuthCookie(res);
    return res.json({ message: "Logged out", redirecturl: "/" });
}
