const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path : path.join(__dirname, "../.env")})

exports.auth = (req, res, next)=>{
    const token = req.cookies.token;

    if(!token)
        return res.redirect("/auth/student-login");
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if(req.user.role != "student")
            throw new Error("User role must be student")
        console.log(req.user);
        next();
    }catch (e){
        console.log(e);
        return res.redirect("/auth/student-login");
    }
}

exports.orgauth = (req, res, next)=>{
    const token = req.cookies.token;

    if(!token)
        return res.redirect("/auth/organizer-login");
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if(req.user.role != "organization")
            throw new Error("User role must be a co-ordinator")
        console.log(req.user);
        next();
    }catch (e){
        console.log(e);
        return res.redirect("/auth/organizer-login");
    }
}