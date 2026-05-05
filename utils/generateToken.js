const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path : path.join(__dirname, "../.env")})

exports.setCookie = (res, id, role)=>{
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7*24*60*60*1000
    })
}