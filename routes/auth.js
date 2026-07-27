var express = require('express');
var router = express.Router();
const fs = require("fs");

const userDBFileName = "./model/userDB.json";

router.get('/signin', function(req, res) {
    renderSignin(req, res);
});

router.get('/signup', function(req, res) {
    renderSignup(req, res);
});

router.post("/signin/submit", (req, res) => {
    if (!req.body.email || !req.body.password) {
        return renderSignin(req, res, "Email and password cannot be empty.");
    }

    let userDB = readUserDB();

    for(let user of userDB){
        if(user.email == req.body.email 
            && user.password == req.body.password){
                return renderHome(req, res);
        }
    }
    return renderSignin(req, res, "Incorrect username or password. Try again");
});

router.post("/signup/submit", (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.fullname) {
        return renderSignup(req, res, "Fields cannot be empty.");
    }

    let userDB = readUserDB();
    for(let user of userDB){
        if(user.email == req.body.email){
            return renderSignup(req, res, "Email is already used. Try again");
        }
    }

    userDB.push(req.body);
    writeUserDB(userDB);
    renderHome(req, res);
});

router.get('/logout', function(req, res) {
    res.cookie("loggin", "false");
    res.redirect("/");
});


function readUserDB() {
    let data = fs.readFileSync(userDBFileName, "utf-8");
    console.log(data);
    return JSON.parse(data);
}

function writeUserDB(users){
    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync(userDBFileName, data, "utf-8");
}

function renderSignup(req, res, msg){
    res.render('./auth/signup', {msg: msg});
}

function renderSignin(req, res, msg){
    res.render('./auth/signin', {msg: msg});
}

function renderHome(req, res) {
    res.cookie("loggin", "true");
    res.redirect("/feed");
}
module.exports = router;