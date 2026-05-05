const express = require("express");
const path = require("path")

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/",(req, res)=>{
    res.sendFile(path.join(__dirname, "./views/signup.html"));
});

app.listen(3000, (e)=>{
    if(e)
        console.log("Error while starting the server");
    else
        console.log("Server is running in http://localhost:3000");
})