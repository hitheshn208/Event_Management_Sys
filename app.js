const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("./routes/authorizationRoute");
const studentRouter = require("./routes/studentRoutes");
const orgRouter = require("./routes/organizationRoutes");
const { auth, orgauth} = require("./middleware/authmiddleware");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

app.use((req, res, next)=>{
    console.log("Request : ", req.url, req.method);
    next();
})

//^Authorization Router
app.use("/auth", authRouter);
//^Student Router
app.use("/student", auth, studentRouter)

//^Organization Router
app.use("/organization", orgauth, orgRouter)

//^ Route users to the landingpage.
app.get("/",(req, res)=>{
    res.render("landingPage");
});


app.listen(3000, (e)=>{
    if(e)
        console.log("Error while starting the server");
    else
        console.log("Server is running in http://localhost:3000");
})
